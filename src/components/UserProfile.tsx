import { useState } from 'react';
import { User, Mail, LogOut, Trash2, Lock, ChevronLeft, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  onBack: () => void;
}

type ProfileTab = 'info' | 'password' | 'danger';

export function UserProfile({ onBack }: UserProfileProps) {
  const [tab, setTab] = useState<ProfileTab>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { user, logout, updateProfile, changePassword, deleteAccount, error: authError } = useAuth();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await updateProfile(fullName || user?.full_name || '');
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password change failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!window.confirm('Are you sure? This cannot be undone. All your data will be permanently deleted.')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteAccount(deletePassword);
      setMessage('Account deleted. Redirecting...');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Account deletion failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
          <ChevronLeft size={20} className="text-text-muted" />
        </button>
        <h2 className="text-2xl font-bold text-text-primary">Account Settings</h2>
      </div>

      {/* Error & Success Messages */}
      {authError && (
        <div className="p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p>{authError}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      {message && (
        <div className="p-4 bg-green-400/10 border border-green-400/30 rounded-lg text-green-400 text-sm">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab('info')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            tab === 'info'
              ? 'text-accent border-accent'
              : 'text-text-muted hover:text-text-secondary border-transparent'
          }`}
        >
          <User size={16} className="inline mr-2" />
          Profile
        </button>
        <button
          onClick={() => setTab('password')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            tab === 'password'
              ? 'text-accent border-accent'
              : 'text-text-muted hover:text-text-secondary border-transparent'
          }`}
        >
          <Lock size={16} className="inline mr-2" />
          Password
        </button>
        <button
          onClick={() => setTab('danger')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            tab === 'danger'
              ? 'text-red-400 border-red-400'
              : 'text-text-muted hover:text-text-secondary border-transparent'
          }`}
        >
          <Trash2 size={16} className="inline mr-2" />
          Danger
        </button>
      </div>

      {/* Profile Tab */}
      {tab === 'info' && (
        <div className="space-y-6">
          <div className="bg-surface-2 rounded-xl p-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                  <Mail size={16} />
                  Email
                </label>
                <div className="px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary">
                  {user?.email}
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                      <User size={16} />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder={user?.full_name || 'Your name'}
                      className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading && <Loader size={16} className="animate-spin" />}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 bg-surface border border-border text-text-primary rounded-lg font-medium hover:bg-surface-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                      <User size={16} />
                      Full Name
                    </label>
                    <div className="px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary">
                      {user?.full_name || 'Not set'}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-text-muted mb-2 block">
                      Email Verified
                    </label>
                    <div className="px-4 py-2.5 bg-surface border border-border rounded-lg flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${user?.email_verified ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <span className="text-text-primary">{user?.email_verified ? 'Verified' : 'Pending verification'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFullName(user?.full_name || '');
                      setIsEditing(true);
                    }}
                    className="w-full py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
                  >
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div className="bg-surface-2 rounded-xl p-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                <Lock size={16} />
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                <Lock size={16} />
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                <Lock size={16} />
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader size={16} className="animate-spin" />}
              Change Password
            </button>
          </form>
        </div>
      )}

      {/* Danger Tab */}
      {tab === 'danger' && (
        <div className="bg-red-400/10 border-2 border-red-400/30 rounded-xl p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">Delete Account</h3>
            <p className="text-sm text-text-muted mb-4">
              This action cannot be undone. All your conversations, data, and settings will be permanently deleted.
            </p>
          </div>

          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-text-muted mb-2">
                <Lock size={16} />
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-surface border border-red-400/50 rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-red-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-red-400/20 hover:bg-red-400/30 text-red-400 border border-red-400/50 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading && <Loader size={16} className="animate-spin" />}
              Delete My Account
            </button>
          </form>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full py-2.5 bg-surface border border-border text-text-primary rounded-lg font-medium hover:bg-surface-2 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
