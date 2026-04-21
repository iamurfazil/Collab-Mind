import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store'; // Adjust path as needed
import { 
  LayoutDashboard, Lightbulb, Users, MessageSquare, 
  Megaphone, LogOut, TrendingUp, Activity, Menu, X
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Security Check: Kick out anyone who isn't the admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user || user.role !== 'admin') return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'announcements', label: 'Announcements', icon: Megaphone },
  ];

  // Mock data for the overview metrics
  const metrics = [
    { label: 'Total Users', value: '1,248', trend: '+12%', icon: Users, color: 'from-blue-400 to-blue-600', shadow: 'shadow-blue-500/20' },
    { label: 'Active Ideas', value: '342', trend: '+5%', icon: Lightbulb, color: 'from-orange-500 to-orange-400', shadow: 'shadow-orange-500/20' },
    { label: 'Pending Feedback', value: '28', trend: '-2%', icon: MessageSquare, color: 'from-purple-400 to-purple-600', shadow: 'shadow-purple-500/20' },
    { label: 'Platform Activity', value: '94%', trend: '+8%', icon: Activity, color: 'from-green-400 to-green-600', shadow: 'shadow-green-500/20' },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 fixed inset-y-0 z-40">
        <div className="flex-1 flex flex-col bg-white/80 backdrop-blur-2xl border-r border-gray-200/60 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 px-6 py-8 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center shadow-lg shadow-gray-900/20">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 block leading-none">Admin Panel</span>
              <span className="text-xs text-orange-500 font-semibold tracking-wider">COLLAB MIND</span>
            </div>
          </div>

          {/* Navigation */}
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

          {/* Logout Section */}
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

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm h-16 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-gray-50 text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-gray-900">Admin Panel</span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
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
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
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
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
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

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 pt-20 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          
          {/* Header Greeting */}
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              Hey Fazil 👋
            </h1>
            <p className="text-gray-500 text-lg mt-1">Here is what's happening on Collab Mind today.</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* OVERVIEW TAB */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {metrics.map((metric, index) => (
                    <motion.div
                      key={metric.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.4 }}
                      className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-3xl p-6 relative overflow-hidden group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${metric.color} shadow-lg ${metric.shadow} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                          <metric.icon className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                        <span className={`text-sm font-bold flex items-center gap-1 ${metric.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          <TrendingUp className="w-4 h-4" /> {metric.trend}
                        </span>
                      </div>
                      <div className="text-3xl font-extrabold text-gray-900 mb-1">{metric.value}</div>
                      <div className="text-sm font-medium text-gray-500">{metric.label}</div>
                    </motion.div>
                  ))}
                </div>

                {/* System Status / Quick View */}
                <div className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-3xl p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">System Status</h2>
                  <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                    <p className="text-gray-500 font-medium">Chart integration goes here (Chart.js / Recharts)</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PLACEHOLDER FOR OTHER TABS */}
            {activeTab !== 'dashboard' && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white/80 backdrop-blur-xl border border-gray-200/60 shadow-sm rounded-3xl p-16 text-center"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LayoutDashboard className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">{activeTab} Management</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  The {activeTab} module is ready to be populated with data from your Firebase collections.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}