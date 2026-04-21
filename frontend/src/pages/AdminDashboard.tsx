import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  FileText,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Megaphone,
  Menu,
  RefreshCw,
  Save,
  ShieldCheck,
  MessageSquare,
  Users,
  X,
} from 'lucide-react';
import { useStore } from '../store';
import { getAdminDashboard, updateAdminUserRole } from '../services/api';

type Role = 'owner' | 'builder' | 'admin';
type TabId = 'dashboard' | 'users' | 'ideas' | 'feedback' | 'announcements';

type AdminUser = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  city?: string;
  state?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type AdminIdea = {
  id: string;
  title: string;
  userName: string;
  userId: string;
  status: string;
  projectStatus?: string;
  isPublished?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type AdminFeedback = {
  id: string;
  userName: string;
  email: string;
  category: string;
  message: string;
  status: string;
  timestamp?: string | null;
  formattedDate?: string | null;
};

type AdminAnnouncement = {
  id: string;
  title: string;
  message: string;
  status: string;
  createdAt?: string | null;
};

type AdminDashboardData = {
  summary: {
    totalUsers: number;
    adminUsers: number;
    ownerUsers: number;
    builderUsers: number;
    totalIdeas: number;
    activeIdeas: number;
    completedIdeas: number;
    pendingFeedback: number;
  };
  users: AdminUser[];
  ideas: AdminIdea[];
  feedback: AdminFeedback[];
  announcements: AdminAnnouncement[];
};

const roleOptions: Array<{ value: Role; label: string }> = [
  { value: 'builder', label: 'Builder' },
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
];

function formatDate(value?: string | null) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatLocation(city?: string, state?: string) {
  const parts = [city, state].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Not provided';
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, authToken, isAuthReady, addNotification } = useStore();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, Role>>({});

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user || user.role !== 'admin') {
      navigate('/auth');
    }
  }, [isAuthReady, navigate, user]);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = await getAdminDashboard(authToken || undefined);
      const data = payload?.data as AdminDashboardData;
      setDashboard(data);
      setRoleDrafts(Object.fromEntries((data?.users || []).map((item) => [item.id, item.role])));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthReady && user?.role === 'admin') {
      void loadDashboard();
    }
  }, [authToken, isAuthReady, user?.role]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveRole = async (userId: string) => {
    const nextRole = roleDrafts[userId];
    if (!nextRole) return;

    setSavingUserId(userId);
    try {
      await updateAdminUserRole(userId, nextRole, authToken || undefined);
      addNotification('User role updated successfully.', 'success');
      await loadDashboard();
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to update role.', 'error');
    } finally {
      setSavingUserId(null);
    }
  };

  const navItems: Array<{ id: TabId; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  const metrics = useMemo(() => {
    const summary = dashboard?.summary;

    return [
      { label: 'Total Users', value: summary?.totalUsers ?? 0, icon: Users, color: 'from-blue-500 to-cyan-500' },
      { label: 'Admin Users', value: summary?.adminUsers ?? 0, icon: ShieldCheck, color: 'from-amber-500 to-orange-500' },
      { label: 'Active Ideas', value: summary?.activeIdeas ?? 0, icon: Lightbulb, color: 'from-orange-500 to-rose-500' },
      { label: 'Completed Ideas', value: summary?.completedIdeas ?? 0, icon: FileText, color: 'from-emerald-500 to-green-500' },
      { label: 'Pending Feedback', value: summary?.pendingFeedback ?? 0, icon: MessageSquare, color: 'from-violet-500 to-purple-500' },
      { label: 'Platform Activity', value: summary?.totalIdeas ? `${Math.round((summary.activeIdeas / summary.totalIdeas) * 100)}%` : '0%', icon: Activity, color: 'from-sky-500 to-indigo-500' },
    ];
  }, [dashboard]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <aside className="hidden lg:flex flex-col w-72 fixed inset-y-0 z-40">
        <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-2xl border-r border-gray-200/60 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3 px-6 py-8 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center shadow-lg shadow-gray-900/20">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 block leading-none">Admin Panel</span>
              <span className="text-xs text-orange-500 font-semibold tracking-wider">COLLAB MIND</span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Menu</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-orange-500/10 to-orange-400/5 text-orange-600 shadow-[inset_3px_0_0_0_#f97316] font-bold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-orange-500' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100 bg-white/50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors font-semibold"
            >
              <LogOut className="w-5 h-5" />
              <span>Secure Logout</span>
            </motion.button>
          </div>
        </div>
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-gray-50 text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-gray-900">Admin Panel</span>
        </div>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
                <span className="text-xl font-bold text-gray-900">Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 bg-gray-50 rounded-xl text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'text-gray-500 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
              <div className="p-4 border-t border-gray-100">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 bg-red-50 font-semibold">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:ml-72 pt-20 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4 flex-col lg:flex-row">
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                Hey {user.displayName || 'Admin'} 👋
              </h1>
              <p className="text-gray-500 text-lg mt-1">Live data from Firestore and the GCP backend.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => void loadDashboard()} className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-700 font-semibold shadow-sm hover:bg-gray-50">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 text-red-600 font-semibold hover:bg-red-100">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </motion.div>

          {loading && (
            <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-3xl p-10 text-center text-gray-500">
              Loading dashboard data from Firestore...
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-4 flex items-center justify-between gap-4">
              <span>{error}</span>
              <button onClick={() => void loadDashboard()} className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold">Retry</button>
            </div>
          )}

          {!loading && dashboard && (
            <>
              {activeTab === 'dashboard' && (
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {metrics.map((metric) => (
                      <div key={metric.label} className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-3xl p-6 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${metric.color} shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                            <metric.icon className="w-6 h-6 text-white drop-shadow-md" />
                          </div>
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Live</span>
                        </div>
                        <div className="text-3xl font-extrabold text-gray-900 mb-1">{metric.value}</div>
                        <div className="text-sm font-medium text-gray-500">{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-3xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
                        <span className="text-sm text-gray-500">{dashboard.users.length} loaded</span>
                      </div>
                      <div className="space-y-3">
                        {dashboard.users.slice(0, 5).map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3">
                            <div>
                              <div className="font-semibold text-gray-900">{item.displayName}</div>
                              <div className="text-sm text-gray-500">{item.email}</div>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full">{item.role}</span>
                          </div>
                        ))}
                        {dashboard.users.length === 0 && <div className="text-gray-500 text-sm">No users found in Firestore.</div>}
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-3xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Recent Ideas</h2>
                        <span className="text-sm text-gray-500">{dashboard.ideas.length} loaded</span>
                      </div>
                      <div className="space-y-3">
                        {dashboard.ideas.slice(0, 5).map((item) => (
                          <div key={item.id} className="rounded-2xl bg-gray-50 px-4 py-3">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="font-semibold text-gray-900">{item.title}</div>
                                <div className="text-sm text-gray-500">{item.userName}</div>
                              </div>
                              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{item.status}</span>
                            </div>
                          </div>
                        ))}
                        {dashboard.ideas.length === 0 && <div className="text-gray-500 text-sm">No ideas found in Firestore.</div>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'users' && (
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-3xl p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Users</h2>
                    <span className="text-sm text-gray-500">Edit Firestore roles here</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-xs uppercase tracking-wider text-gray-400 border-b border-gray-200">
                          <th className="py-3 pr-4">User</th>
                          <th className="py-3 pr-4">Email</th>
                          <th className="py-3 pr-4">Location</th>
                          <th className="py-3 pr-4">Role</th>
                          <th className="py-3 pr-4">Updated</th>
                          <th className="py-3 pr-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.users.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-4 pr-4 font-semibold text-gray-900">{item.displayName}</td>
                            <td className="py-4 pr-4 text-gray-600">{item.email}</td>
                            <td className="py-4 pr-4 text-gray-600">{formatLocation(item.city, item.state)}</td>
                            <td className="py-4 pr-4">
                              <select
                                value={roleDrafts[item.id] || item.role}
                                onChange={(event) => setRoleDrafts((current) => ({ ...current, [item.id]: event.target.value as Role }))}
                                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900"
                              >
                                {roleOptions.map((option) => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-4 pr-4 text-gray-500 text-sm">{formatDate(item.updatedAt || item.createdAt)}</td>
                            <td className="py-4 pr-4 text-right">
                              <button
                                onClick={() => void handleSaveRole(item.id)}
                                disabled={savingUserId === item.id}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-60"
                              >
                                <Save className="w-4 h-4" />
                                {savingUserId === item.id ? 'Saving...' : 'Save'}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {dashboard.users.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-10 text-center text-gray-500">No users available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'ideas' && (
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-3xl p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Ideas</h2>
                    <span className="text-sm text-gray-500">Loaded from Firestore</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-xs uppercase tracking-wider text-gray-400 border-b border-gray-200">
                          <th className="py-3 pr-4">Title</th>
                          <th className="py-3 pr-4">Owner</th>
                          <th className="py-3 pr-4">Status</th>
                          <th className="py-3 pr-4">Project Status</th>
                          <th className="py-3 pr-4">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboard.ideas.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-4 pr-4 font-semibold text-gray-900">{item.title}</td>
                            <td className="py-4 pr-4 text-gray-600">{item.userName}</td>
                            <td className="py-4 pr-4 text-gray-600">{item.status}</td>
                            <td className="py-4 pr-4 text-gray-600">{item.projectStatus || 'N/A'}</td>
                            <td className="py-4 pr-4 text-gray-500 text-sm">{formatDate(item.createdAt)}</td>
                          </tr>
                        ))}
                        {dashboard.ideas.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-10 text-center text-gray-500">No ideas available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'feedback' && (
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-3xl p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Feedback</h2>
                    <span className="text-sm text-gray-500">Read from the feedback collection</span>
                  </div>
                  <div className="space-y-3">
                    {dashboard.feedback.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">{item.userName}</div>
                            <div className="text-sm text-gray-500">{item.email}</div>
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">{item.status}</span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">{item.message}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">{item.category} • {item.formattedDate || formatDate(item.timestamp)}</div>
                      </div>
                    ))}
                    {dashboard.feedback.length === 0 && <div className="text-gray-500 text-sm">No feedback documents found in Firestore.</div>}
                  </div>
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-3xl p-6 overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
                    <span className="text-sm text-gray-500">Loaded from Firestore</span>
                  </div>
                  <div className="space-y-3">
                    {dashboard.announcements.map((item) => (
                      <div key={item.id} className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="font-semibold text-gray-900">{item.title}</div>
                          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">{item.status}</span>
                        </div>
                        <div className="text-sm text-gray-600">{item.message || 'No message provided.'}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mt-2">{formatDate(item.createdAt)}</div>
                      </div>
                    ))}
                    {dashboard.announcements.length === 0 && <div className="text-gray-500 text-sm">No announcements found in Firestore.</div>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
