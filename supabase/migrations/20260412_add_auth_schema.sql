-- Add user_id to conversations table
ALTER TABLE conversations ADD COLUMN user_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE conversations ADD CONSTRAINT fk_conversations_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE conversations ADD COLUMN is_shared boolean DEFAULT false;
CREATE INDEX idx_conversations_user_id ON conversations(user_id);

-- Add user_id to messages table
ALTER TABLE messages ADD COLUMN user_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE messages ADD CONSTRAINT fk_messages_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX idx_messages_user_id ON messages(user_id);

-- Create users_profiles table
CREATE TABLE IF NOT EXISTS users_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now(),
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email_verified boolean DEFAULT false
);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  details jsonb,
  created_at timestamp DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Conversations RLS Policies
DROP POLICY IF EXISTS "Users see own conversations" ON conversations;
CREATE POLICY "Users see own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own conversations" ON conversations;
CREATE POLICY "Users insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own conversations" ON conversations;
CREATE POLICY "Users update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own conversations" ON conversations;
CREATE POLICY "Users delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages RLS Policies
DROP POLICY IF EXISTS "Users see messages in their conversations" ON messages;
CREATE POLICY "Users see messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users insert messages in their conversations" ON messages;
CREATE POLICY "Users insert messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users update messages in their conversations" ON messages;
CREATE POLICY "Users update messages in their conversations" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users delete messages in their conversations" ON messages;
CREATE POLICY "Users delete messages in their conversations" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND c.user_id = auth.uid()
    )
  );

-- Users Profiles RLS Policies
DROP POLICY IF EXISTS "Users see own profile" ON users_profiles;
CREATE POLICY "Users see own profile" ON users_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users update own profile" ON users_profiles;
CREATE POLICY "Users update own profile" ON users_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Auto-create profile on signup" ON users_profiles;
CREATE POLICY "Auto-create profile on signup" ON users_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin Logs RLS Policies
DROP POLICY IF EXISTS "Admins see all logs" ON admin_logs;
CREATE POLICY "Admins see all logs" ON admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can create logs" ON admin_logs;
CREATE POLICY "Admins can create logs" ON admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Create trigger to auto-create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
