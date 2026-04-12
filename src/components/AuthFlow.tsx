import { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type AuthPage = 'login' | 'signup' | 'reset-password' | 'verify-email';

export function AuthFlow() {
  const [page, setPage] = useState<AuthPage>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { login, signup, resetPassword, error, clearError } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);
    try {
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, fullName);
      setMessage('Account created! Check your email for verification.');
      setPage('verify-email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsLoading(true);
    try {
      await resetPassword(email);
      setMessage('Password reset email sent! Check your inbox.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface to-surface-2 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Sparks</h1>
          <p className="text-text-muted">Professional AI Chat</p>
        </div>

        {/* Auth Form */}
        <div className="bg-surface-2 rounded-2xl border border-border p-8 shadow-lg">
          {page === 'login' && (
            <>
              <h2 className="text-xl font-semibold text-text-primary mb-6">Welcome back</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg focus-within:border-accent transition-colors">
                    <Mail size={18} className="text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg focus-within:border-accent transition-colors">
                    <Lock size={18} className="text-text-muted" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="mt-6 space-y-3">
                <button
                  onClick={() => { setPage('reset-password'); clearError(); }}
                  className="w-full text-center text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  Forgot password?
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-surface-2 text-text-muted">or</span>
                  </div>
                </div>

                <button
                  onClick={() => { setPage('signup'); clearError(); }}
                  className="w-full py-2.5 border border-border rounded-lg text-text-primary hover:bg-surface transition-colors font-medium"
                >
                  Create account
                </button>
              </div>
            </>
          )}

          {page === 'signup' && (
            <>
              <h2 className="text-xl font-semibold text-text-primary mb-6">Create account</h2>
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg focus-within:border-accent transition-colors">
                    <User size={18} className="text-text-muted" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg focus-within:border-accent transition-colors">
                    <Mail size={18} className="text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg focus-within:border-accent transition-colors">
                    <Lock size={18} className="text-text-muted" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Confirm Password</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg focus-within:border-accent transition-colors">
                    <Lock size={18} className="text-text-muted" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
                {message && <p className="text-sm text-green-400 bg-green-400/10 p-3 rounded-lg">{message}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { setPage('login'); clearError(); }}
                  className="text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  Already have an account? <span className="text-accent">Login</span>
                </button>
              </div>
            </>
          )}

          {page === 'reset-password' && (
            <>
              <h2 className="text-xl font-semibold text-text-primary mb-6">Reset password</h2>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-lg focus-within:border-accent transition-colors">
                    <Mail size={18} className="text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <p className="text-sm text-text-muted">We'll send you an email with instructions to reset your password.</p>

                {error && <p className="text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</p>}
                {message && <p className="text-sm text-green-400 bg-green-400/10 p-3 rounded-lg">{message}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  {isLoading ? 'Sending...' : 'Send reset email'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { setPage('login'); clearError(); }}
                  className="text-sm text-text-secondary hover:text-accent transition-colors"
                >
                  Back to <span className="text-accent">login</span>
                </button>
              </div>
            </>
          )}

          {page === 'verify-email' && (
            <>
              <h2 className="text-xl font-semibold text-text-primary mb-6">Verify your email</h2>
              <div className="space-y-4">
                <p className="text-text-muted">We've sent a verification email to:</p>
                <p className="font-medium text-text-primary bg-surface p-3 rounded-lg text-center">{email}</p>
                <p className="text-sm text-text-muted">Click the link in the email to verify your account. You can start using Sparks right away!</p>

                <button
                  onClick={() => { setPage('login'); clearError(); }}
                  className="w-full py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
                >
                  Continue to login
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-text-muted space-y-2">
          <p>
            <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>
            {' • '}
            <a href="/support" className="text-accent hover:underline">Support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
