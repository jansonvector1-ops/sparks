import { useState, useEffect } from 'react';
import { ChevronLeft, Trash2, Users, Activity, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AdminPanelProps {
  onBack: () => void;
}

interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  created_at: string;
  email_verified: boolean;
}

interface AdminLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

type Tab = 'users' | 'logs';

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin()) {
      setError('You do not have admin access');
      return;
    }

    if (tab === 'users') {
      fetchUsers();
    } else {
      fetchLogs();
    }
  }, [tab]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/admin/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!window.confirm(`Delete user ${userEmail}? This cannot be undone.`)) {
      return;
    }

    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Deleted via admin panel' }),
      });

      if (!response.ok) throw new Error('Failed to delete user');
      setMessage(`User ${userEmail} deleted successfully`);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-surface-2 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-text-muted" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Admin Panel</h2>
            <p className="text-sm text-text-muted">Manage users and system activity</p>
          </div>
        </div>
      </div>

      {/* Messages */}
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
      <div className="flex gap-4 border-b border-border">
        <button
          onClick={() => setTab('users')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            tab === 'users'
              ? 'text-accent border-accent'
              : 'text-text-muted hover:text-text-secondary border-transparent'
          }`}
        >
          <Users size={18} />
          Users
        </button>
        <button
          onClick={() => setTab('logs')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 flex items-center gap-2 ${
            tab === 'logs'
              ? 'text-accent border-accent'
              : 'text-text-muted hover:text-text-secondary border-transparent'
          }`}
        >
          <Activity size={18} />
          Activity Logs
        </button>
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size={32} className="animate-spin text-accent" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              No users found
            </div>
          ) : (
            <div className="bg-surface-2 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-muted">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-muted">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-muted">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-muted">Verified</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-muted">Joined</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr
                        key={u.id}
                        className={`border-b border-border ${i % 2 === 0 ? 'bg-surface' : ''} hover:bg-surface-3 transition-colors`}
                      >
                        <td className="px-6 py-3 text-sm text-text-primary">{u.email}</td>
                        <td className="px-6 py-3 text-sm text-text-secondary">{u.full_name || '-'}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            u.role === 'admin'
                              ? 'bg-accent/20 text-accent'
                              : 'bg-text-muted/20 text-text-muted'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${u.email_verified ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                            <span className="text-text-secondary">{u.email_verified ? 'Yes' : 'No'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-text-muted">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          {user?.id !== u.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {tab === 'logs' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader size={32} className="animate-spin text-accent" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              No activity logs found
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="bg-surface-2 rounded-lg p-4 border border-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Activity size={16} className="text-accent" />
                        <span className="font-semibold text-text-primary capitalize">
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                    {log.details && (
                      <div className="text-right">
                        <p className="text-xs text-text-muted">
                          {log.details.reason && `Reason: ${log.details.reason}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
