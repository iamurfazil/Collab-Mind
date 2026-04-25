import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { 
  X, MessageSquare, ShieldCheck, Calendar, BookOpen, GraduationCap,
  Building2, Laptop, Linkedin
} from 'lucide-react';

export default function ProfileModal() {
  const { profileToView, setShowProfileModal,  user: currentUser } = useStore();

  if (!profileToView) return null;

  const isOwnProfile = currentUser?.id === profileToView.id;

  // Helper to format academic year
  const formatYear = (year?: string) => {
    if (!year) return '';
    const yearMap: { [key: string]: string } = {
      '1': '1st Year',
      '2': '2nd Year',
      '3': '3rd Year',
      '4': '4th Year',
      '5': '5th Year',
    };
    return yearMap[year] || `${year} Year`;
  };

  const handleShareLinkedIn = () => {
    const shareUrl = window.location.origin;
    const shareText = encodeURIComponent(
      `Check out my verified ${profileToView.role} ID on Collab-Mind! 🚀 ID: ${profileToView.id?.substring(0, 12).toUpperCase()}`
    );
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&text=${shareText}`;
    window.open(linkedinUrl, '_blank');
  };

  const stats = [
    { label: 'Problems', value: profileToView.problemsPosted || 0 },
    { label: 'Projects', value: profileToView.activeProjects || 0 },
    { label: 'Completed', value: profileToView.completedProjects || 0 },
    { label: 'Trust Score', value: profileToView.trustScore || 0 },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        // Perspective creates the 3D space
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 perspective-[1500px]" 
        onClick={() => setShowProfileModal(false)}
      >
        {/* --- 3D CARD BODY WITH CONTINUOUS TILT ANIMATION --- */}
        <motion.div
          initial={{ scale: 0.8, y: 100, opacity: 0, rotateX: 15 }}
          animate={{ 
            scale: 1, 
            y: 0, 
            opacity: 1, 
            rotateX: [0, -3, 3, 0], // Subtle slow float/tilt
            rotateY: [0, 3, -3, 0] 
          }}
          transition={{
            type: "spring", damping: 20, stiffness: 200, // Entrance animation
            rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" }, // Slow infinite 3D float
            rotateY: { duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }
          }}
          exit={{ scale: 0.8, y: 100, opacity: 0, rotateX: 15 }}
          onClick={(e) => e.stopPropagation()}
          // transform-style-3d is crucial for the effect
          className="relative w-full max-w-sm bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100 pb-8 transform-style-3d card-3d-effect" 
        >
          {/* --- GEOMETRIC ID CARD ACCENTS (ORANGE) --- */}
          {/* Top Left Squares */}
          <div className="absolute top-8 left-6 w-3.5 h-3.5 bg-orange-500"></div>
          <div className="absolute top-5 left-11 w-2 h-2 bg-orange-500"></div>
          
          {/* Left Edge Tab */}
          <div className="absolute top-1/3 left-0 w-2.5 h-16 bg-orange-500 rounded-r-md"></div>
          
          {/* Bottom Left L-Shape */}
          <div className="absolute bottom-0 left-0 w-24 h-6 bg-orange-500 rounded-tr-2xl"></div>
          <div className="absolute bottom-0 left-0 w-6 h-20 bg-orange-500 rounded-tr-lg"></div>
          {/* Shadow/Blur Accent */}
          <div className="absolute bottom-8 left-8 w-16 h-4 bg-orange-500/10 rounded-full blur-sm"></div>

          {/* Bottom Right Squares */}
          <div className="absolute bottom-6 right-6 w-3 h-3 bg-orange-500"></div>
          <div className="absolute bottom-10 right-10 w-1.5 h-1.5 bg-orange-500"></div>

          {/* Close Button */}
          <button
            onClick={() => setShowProfileModal(false)}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-orange-600 cursor-hover transition-colors z-30"
          >
            <X className="w-5 h-5" />
          </button>

          {/* --- ID CARD CONTENT --- */}
          <div className="relative z-10 flex flex-col items-center pt-16 px-8">
            
            {/* Avatar (Orange) */}
            <div className="w-28 h-28 rounded-full bg-orange-500 flex items-center justify-center text-white text-4xl font-black shadow-md mb-5 border-4 border-white">
              {profileToView.displayName.charAt(0).toUpperCase()}
            </div>

            {/* Name & Role (Orange highlights) */}
            <h2 className="text-2xl font-black text-orange-950 text-center tracking-tight flex items-center gap-2">
              {profileToView.displayName}
              {profileToView.isVerified && (
                <ShieldCheck className="w-5 h-5 text-green-500" />
              )}
            </h2>
            <div className="text-xs font-bold text-orange-900/80 mt-1 mb-8 uppercase tracking-widest flex items-center gap-2">
              <span>Collab Mind</span>
              <span className="w-1 h-1 rounded-full bg-orange-500"></span>
              <span>{profileToView.role === 'owner' ? 'Problem Owner' : 'Builder'}</span>
            </div>

            {/* --- PROFESSION DETAILS (Dynamic & Orange Theme) --- */}
            <div className="w-full space-y-3.5 pl-2 mb-8 bg-orange-50 p-4 rounded-xl border border-orange-100 relative transform-style-3d">
              {/* Subtle orange "glow" layer behind the details box to enhance 3D feel */}
              <div className="absolute inset-0 bg-orange-200/50 rounded-xl blur-md translate-z-[-1px]"></div>
              
              {/* Default to Student view if profession is missing from mock data */}
              {(!profileToView.profession || profileToView.profession === 'student') && (
                <>
                  <div className="flex items-center gap-3 text-sm text-gray-800 font-semibold relative z-10">
                    <BookOpen className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    College: <span className="font-medium text-gray-700">{profileToView.collegeName || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-800 font-semibold relative z-10">
                    <GraduationCap className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    Course: <span className="font-medium text-gray-700">{profileToView.stream || 'Not specified'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-800 font-semibold relative z-10">
                      <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-sm flex-shrink-0"></div>
                          {profileToView.btechYear ? formatYear(profileToView.btechYear) : 'Year N/A'}
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-sm flex-shrink-0"></div>
                          {profileToView.btechSemester ? `Sem ${profileToView.btechSemester}` : 'Sem N/A'}
                      </div>
                  </div>
                </>
              )}

              {profileToView.profession === 'professional' && (
                <div className="flex items-center gap-3 text-sm text-gray-800 font-semibold relative z-10">
                  <Building2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  Org: <span className="font-medium text-gray-700">{profileToView.orgName || 'Not specified'}</span>
                </div>
              )}

              {profileToView.profession === 'freelancer' && (
                <div className="flex items-center gap-3 text-sm text-gray-800 font-semibold relative z-10">
                  <Laptop className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  <span className="font-medium text-gray-700">Independent Freelancer</span>
                </div>
              )}
            </div>

            {/* General joined date bullet */}
            <div className="w-full pl-2 mb-8 flex items-center gap-3 text-sm text-gray-800 font-semibold">
                <Calendar className="w-4 h-4 text-orange-600 flex-shrink-0" />
                Joined {new Date(profileToView.joinDate || profileToView.createdAt || Date.now()).getFullYear()}
            </div>

            {/* Skills (Smaller, below details) */}
            {profileToView.skills && profileToView.skills.length > 0 && (
              <div className="w-full mb-6">
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {profileToView.skills.slice(0, 5).map((skill) => (
                    <span key={skill} className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200 text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Small Footer Text / Mock URL (Orange tint) */}
            <div className="w-full text-[0.65rem] text-orange-800/80 font-mono mb-6 leading-tight tracking-tight">
              <p>ID: {(profileToView.uid || profileToView.id)?.substring(0, 12).toUpperCase() || 'UNKNOWN'}</p>
              <p>AUTH: COLLABMIND.COM/VERIFY</p>
            </div>

            {/* Stats Grid (Orange values) */}
            <div className="w-full grid grid-cols-4 gap-2 py-4 border-t border-gray-100 bg-gray-50/50 rounded-t-xl">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl font-black text-orange-500">{stat.value}</div>
                  <div className="text-[0.6rem] uppercase font-bold text-gray-500 mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="w-full mt-4 space-y-3">
              {isOwnProfile ? (
                <motion.button
                  onClick={handleShareLinkedIn}
                  className="w-full py-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-xl shadow-md cursor-hover flex items-center justify-center gap-2 transition-all hover:from-blue-700 hover:to-blue-600"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Linkedin className="w-5 h-5" />
                  Share ID to LinkedIn
                </motion.button>
              ) : (
                <motion.button
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-xl shadow-md cursor-hover flex items-center justify-center gap-2 transition-all hover:from-orange-600 hover:to-orange-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageSquare className="w-5 h-5" />
                  Send Message
                </motion.button>
              )}
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}