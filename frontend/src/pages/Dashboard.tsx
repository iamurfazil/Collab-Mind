import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import Overview from '../components/dashboard/Overview';
import AIProjectGenerator from '../components/dashboard/AIProjectGenerator';
import MyIdeas from '../components/dashboard/MyIdeas';
import BrowseIdeas from '../components/dashboard/BrowseIdeas';
import Requests from '../components/dashboard/Requests';
import Chat from '../components/dashboard/Chat';
import NexusAI from '../components/dashboard/NexusAI';
import Submissions from '../components/dashboard/Submissions';
import Certificates from '../components/dashboard/Certificates';
import Settings from '../components/dashboard/Settings';
import ProfileModal from '../components/ProfileModal';
import CurrentProjects from '../components/dashboard/CurrentProjects';
import ProjectWorkspace from '../components/dashboard/ProjectWorkspace';
import { 
  LayoutDashboard, Lightbulb, Users, MessageSquare, FileText, 
  Award, Settings as SettingsIcon, Menu, X, LogOut, ChevronDown,
<<<<<<< HEAD
  Zap, User, Sparkles, Bot
=======
  Zap, User, Bot
>>>>>>> a12b3953ac60985c5ad1e82342b0925b6aa50341
} from 'lucide-react';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'ai-generator', label: 'AI Generator', icon: Sparkles, path: '/dashboard/ai-generator' },
  { id: 'my-ideas', label: 'My Ideas', icon: Lightbulb, path: '/dashboard/my-ideas' },
  { id: 'browse-ideas', label: 'Problem Marketplace', icon: Users, path: '/dashboard/browse-ideas' },
  { id: 'requests', label: 'Requests', icon: MessageSquare, path: '/dashboard/requests' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/dashboard/chat' },
  { id: 'current-projects', label: 'Current Projects', icon: Zap, path: '/dashboard/current-projects' },
  { id: 'submissions', label: 'Submissions', icon: FileText, path: '/dashboard/submissions' },
  { id: 'certificates', label: 'Certificates', icon: Award, path: '/dashboard/certificates' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/dashboard/settings' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, showProfileModal } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [nexusFabOpen, setNexusFabOpen] = useState(false);

  const currentPath = location.pathname;

  const filteredNavItems = navItems.filter(item => {
    if (item.id === "browse-ideas" && user?.role === "owner") return false;
    if (item.id === "certificates" && user?.role === "owner") return false;
    if (item.id === "ai-generator" && user?.role === "builder") return false;
    return true;
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  useEffect(() => {
    setNexusFabOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNexusFabOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goToProfile = () => {
    setProfileMenuOpen(false);
    navigate('/dashboard/settings');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 fixed inset-y-0 z-40">
        <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
          <div className="flex items-center gap-3 px-6 py-6">
            <Link to="/" className="flex items-center gap-3 cursor-hover">
              <div className="h-10 flex items-center">
                <img src="/collabmindbg.jpeg" className="h-full object-contain" alt="Logo" />
              </div>
              <span className="text-xl font-bold gradient-text">Collab Mind</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-hover ${
                  currentPath === item.path
                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-400/20 text-orange-500'
                    : 'text-gray-500 hover:bg-orange-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile Footer Section */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-hover"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 truncate">{user.displayName}</div>
                <div className="text-sm text-gray-500">{user.role === 'owner' ? 'Problem Owner' : 'Builder'}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {profileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-2 p-2 rounded-xl bg-white shadow-lg border border-gray-100 space-y-1"
                >
                  <button
                    onClick={goToProfile}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-orange-50 hover:text-orange-600 cursor-hover transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Profile</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-red-500 hover:bg-red-50 cursor-hover transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 ${sidebarOpen ? 'hidden' : ''}`}>
        <div className="flex items-center justify-between px-4 h-16">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 cursor-hover">
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 flex items-center">
              <img src="/collabmindbg.jpeg" className="h-full object-contain" alt="Logo" />
            </div>
            <span className="font-bold gradient-text">Collab Mind</span>
          </Link>

          <button
            onClick={goToProfile}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold"
          >
            {user.displayName.charAt(0).toUpperCase()}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Content */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/20 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              className="lg:hidden fixed top-0 left-0 w-full max-w-xs h-[92vh] z-50 bg-white border-r border-gray-200 flex flex-col overflow-y-auto"
            >
              <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
                <Link to="/" className="flex items-center gap-3">
                  <div className="h-10 flex items-center"><img src="/collabmindbg.jpeg" className="h-full object-contain" alt="Logo" /></div>
                  <span className="text-xl font-bold gradient-text">Collab Mind</span>
                </Link>
              </div>
              
              <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-hover ${
                      currentPath === item.path
                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-400/20 text-orange-500'
                        : 'text-gray-500 hover:bg-orange-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-auto p-4 border-t border-gray-200 pb-10 space-y-2">
                <button
                  onClick={goToProfile}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-orange-50 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="relative flex-1 lg:ml-72 pt-16 lg:pt-0 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 right-0 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />
        <div className="relative p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPath}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Routes>
                <Route index element={<Overview />} />
                <Route path="ai-generator" element={<AIProjectGenerator />} />
                <Route path="my-ideas" element={<MyIdeas />} />
                <Route path="browse-ideas" element={<BrowseIdeas />} />
                <Route path="current-projects" element={<CurrentProjects />} />
                <Route path="requests" element={<Requests />} />
                <Route path="chat" element={<Chat />} />
                <Route path="nexus-ai" element={<NexusAI />} />
                <Route path="submissions" element={<Submissions />} />
                <Route path="certificates" element={<Certificates />} />
                <Route path="settings" element={<Settings />} />
                <Route path="workspace/:id" element={<ProjectWorkspace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {nexusFabOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/25 z-50"
              onClick={() => setNexusFabOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 48 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[430px] z-[60] bg-white border-l border-gray-200 shadow-2xl p-4"
            >
              <NexusAI embedded onClose={() => setNexusFabOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {!nexusFabOpen && (
        <div className="fixed right-4 bottom-4 lg:right-8 lg:bottom-8 z-[70]">
          <motion.button
            onClick={() => setNexusFabOpen(true)}
            className="relative h-14 w-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-xl flex items-center justify-center border-2 border-white"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Open Nexus drawer"
          >
            <span className="absolute inset-0 rounded-full ring-4 ring-orange-300/40 pointer-events-none" />
            <span className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </span>
          </motion.button>
        </div>
      )}

      {showProfileModal && <ProfileModal />}
    </div>
  );
}