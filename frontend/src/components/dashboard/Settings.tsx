import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { 
  User, Lock, Bell, Trash2, Save, Camera,
  Mail, AlertTriangle, Linkedin, GraduationCap
} from 'lucide-react';

export default function Settings() {
  const { user, updateUser, deleteAccount, logout, addNotification } = useStore();
  const [activeSection, setActiveSection] = useState<'profile' | 'account' | 'notifications' | 'delete'>('profile');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    linkedin: user?.linkedin || '',
    collegeName: user?.collegeName || '',
    stream: user?.stream || '',
    btechYear: user?.btechYear || '1',
    btechSemester: user?.btechSemester || '1',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    requestAlerts: true,
    projectUpdates: true,
    weeklyDigest: false,
  });

  if (!user) return null;

  const isStudent = user.profession === 'student';

  const semesterOptions = (year: string) => {
    const base = (parseInt(year) - 1) * 2;
    return [
      { value: String(base + 1), label: `Semester ${base + 1}` },
      { value: String(base + 2), label: `Semester ${base + 2}` },
    ];
  };

  const handleYearChange = (year: string) => {
    const firstSem = String((parseInt(year) - 1) * 2 + 1);
    setProfileData({ ...profileData, btechYear: year, btechSemester: firstSem });
  };

  const ordinalSuffix = (n: string) => ['st','nd','rd','th'][Math.min(parseInt(n) - 1, 3)];

  const handleProfileSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateUser({
      displayName: profileData.displayName,
      bio: profileData.bio,
      skills: profileData.skills.split(',').map(s => s.trim()).filter(Boolean),
      linkedin: profileData.linkedin,
      collegeName: profileData.collegeName,
      stream: profileData.stream,
      ...(isStudent && {
        btechYear: profileData.btechYear,
        btechSemester: profileData.btechSemester,
      }),
    });
    
    addNotification('Profile updated successfully!', 'success');
    setSaving(false);
  };

  const handleNotificationSave = () => {
    addNotification('Notification preferences saved!', 'success');
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    logout();
    addNotification('Account deleted', 'info');
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'delete', label: 'Delete Account', icon: Trash2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as typeof activeSection)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-hover ${
                activeSection === section.id
                  ? section.id === 'delete'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-orange-500 text-white shadow-sm'
                  : section.id === 'delete'
                    ? 'bg-white border border-red-200 hover:bg-red-50 text-red-500'
                    : 'bg-white border border-gray-200 hover:bg-orange-50 text-gray-600'
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span className="font-medium">{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
              
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center cursor-hover">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user.displayName}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {isStudent && user.btechYear && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <GraduationCap className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-orange-600 font-medium">
                        {user.btechYear}{ordinalSuffix(user.btechYear)} Year · Sem {user.btechSemester}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Display Name</label>
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">LinkedIn Profile</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Linkedin className="w-5 h-5 text-[#0A66C2]" />
                      </div>
                      <input
                        type="url"
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                        placeholder="https://linkedin.com/in/your-profile"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Bio</label>
                  <textarea
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none text-gray-900 placeholder-gray-400"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={profileData.skills}
                    onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                    placeholder="React, Node.js, Python..."
                  />
                </div>

                {/* Academic Details — students only */}
                {isStudent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-2 border-t border-gray-100"
                  >
                    <div className="flex items-center gap-2 text-gray-900 font-bold mb-1">
                      <GraduationCap className="w-5 h-5 text-orange-500" />
                      Academic Background
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">College/University Name</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={profileData.collegeName}
                            onChange={(e) => setProfileData({ ...profileData, collegeName: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900"
                            placeholder="e.g. Stanford University"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Course/Stream</label>
                        <div className="relative">
                          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={profileData.stream}
                            onChange={(e) => setProfileData({ ...profileData, stream: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900"
                            placeholder="e.g. Computer Science"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">B.Tech Year</label>
                        <select
                          value={profileData.btechYear}
                          onChange={(e) => handleYearChange(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900"
                        >
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Semester</label>
                        <select
                          value={profileData.btechSemester}
                          onChange={(e) => setProfileData({ ...profileData, btechSemester: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900"
                        >
                          {semesterOptions(profileData.btechYear).map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              <motion.button
                onClick={handleProfileSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-xl cursor-hover disabled:opacity-50 shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
              </motion.button>
            </motion.div>
          )}

          {activeSection === 'account' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user.email}</span>
                  <span className="ml-auto text-xs text-gray-400">Cannot be changed</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Account Role</label>
                <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-gray-900 font-medium">
                    {user.role === 'owner' ? 'Problem Owner' : 'Builder'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Membership</label>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      user.membership === 'premium' 
                        ? 'bg-orange-50 border-orange-200 text-orange-600' 
                        : 'bg-gray-100 border-gray-200 text-gray-600'
                    }`}>
                      {user.membership === 'premium' ? 'Premium' : 'Free'}
                    </span>
                  </div>
                  {user.membership === 'free' && (
                    <button 
                      onClick={async () => {
                        await updateUser({ membership: 'premium' });
                        addNotification('Plan successfully activated! You now have Premium access.', 'success');
                      }}
                      className="text-orange-500 hover:text-orange-600 font-medium cursor-hover"
                    >
                      Upgrade to Premium
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>

              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'requestAlerts', label: 'Request Alerts', desc: 'Get notified when you receive collaboration requests' },
                  { key: 'projectUpdates', label: 'Project Updates', desc: 'Updates about your active projects' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Weekly summary of platform activity' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div>
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => setNotificationSettings({
                        ...notificationSettings,
                        [item.key]: !notificationSettings[item.key as keyof typeof notificationSettings]
                      })}
                      className={`w-12 h-6 rounded-full transition-colors cursor-hover border ${
                        notificationSettings[item.key as keyof typeof notificationSettings]
                          ? 'bg-green-500 border-green-500'
                          : 'bg-gray-300 border-gray-300'
                      }`}
                    >
                      <motion.div
                        className="w-5 h-5 rounded-full bg-white shadow-sm"
                        animate={{ x: notificationSettings[item.key as keyof typeof notificationSettings] ? 24 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={handleNotificationSave}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-xl cursor-hover shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Save className="w-5 h-5" /> Save Preferences
              </motion.button>
            </motion.div>
          )}

          {activeSection === 'delete' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-6"
            >
              <h2 className="text-xl font-bold text-red-600">Delete Account</h2>
              
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">This action is irreversible</h3>
                    <p className="text-sm text-gray-600">
                      Once you delete your account, there is no going back. All your data, including ideas, 
                      collaborations, and certificates will be permanently deleted.
                    </p>
                  </div>
                </div>
                
                {!showDeleteConfirm ? (
                  <motion.button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl cursor-hover transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </motion.button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-red-600 font-medium">
                      Are you sure? Type <span className="font-bold">DELETE</span> to confirm.
                    </p>
                    <input
                      type="text"
                      placeholder="Type DELETE"
                      className="w-full px-4 py-2 rounded-xl bg-white border border-red-200 focus:border-red-500 outline-none text-gray-900"
                      onChange={(e) => {
                        if (e.target.value === 'DELETE') handleDeleteAccount();
                      }}
                    />
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="text-gray-500 hover:text-gray-700 text-sm cursor-hover transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}