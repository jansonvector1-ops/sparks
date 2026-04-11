const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
}

export interface SamplingSettings {
  temperature: number;
  topP: number;
  maxTokens: number;
  presencePenalty: number;
  frequencyPenalty: number;
  systemPrompt: string;
}

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_BASE}/api/conversations`);
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
}

export async function createConversation(title: string, model: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/api/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, model }),
  });
  if (!res.ok) throw new Error('Failed to create conversation');
  return res.json();
}

export async function updateConversation(id: string, title: string): Promise<Conversation> {
  const res = await fetch(`${API_BASE}/api/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error('Failed to update conversation');
  return res.json();
}

export async function deleteConversation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/conversations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete conversation');
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/api/conversations/${conversationId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function createMessage(
  conversationId: string,
  role: string,
  content: string,
  messageId: string
): Promise<Message> {
  const res = await fetch(`${API_BASE}/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, content, messageId }),
  });
  if (!res.ok) throw new Error('Failed to save message');
  return res.json();
}

export async function deleteMessage(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/messages/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete message');
}

export interface FreeModel {
  id: string;
  name: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
  supported_parameters?: string[]; // ← இது add ஆச்சு
}

export async function fetchFreeModels(): Promise<FreeModel[]> {
  const res = await fetch(`${API_BASE}/api/models`);
  if (!res.ok) throw new Error('Failed to fetch models');
  return res.json();
}

export async function streamChat(
  model: string,
  chatMessages: { role: string; content: string }[],
  sampling?: Partial<SamplingSettings>,
): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: chatMessages,
      temperature: sampling?.temperature,
      top_p: sampling?.topP,
      max_tokens: sampling?.maxTokens || undefined,
      presence_penalty: sampling?.presencePenalty,
      frequency_penalty: sampling?.frequencyPenalty,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    const error = new Error(err.error || 'Chat request failed') as Error & { statusCode: number };
    error.statusCode = res.status;
    throw error;
  }
  return res.body!;
}
