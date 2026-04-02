import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store';
import { 
  Award, Download, Share2, ExternalLink, Clock, CheckCircle, 
  Star, Trophy, BookOpen, Video, FileText, Lock, Filter
} from 'lucide-react';

interface Certificate {
  id: string;
  userId: string;
  projectId: string;
  projectTitle: string;
  earnedAt: string;
  type: 'completion' | 'excellence' | 'innovation';
  completionScore?: number;
  excellenceScore?: number;
  innovationScore?: number;
}

// Free certification resources (would come from database in production)
const freeResources = [
  {
    id: 'res1',
    title: 'Introduction to Collaborative Development',
    type: 'course',
    duration: '2 hours',
    level: 'Beginner',
    provider: 'Collab Mind Academy',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
    url: '#'
  },
  {
    id: 'res2',
    title: 'Building Effective Team Communication',
    type: 'course',
    duration: '1.5 hours',
    level: 'Intermediate',
    provider: 'Collab Mind Academy',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
    url: '#'
  },
  {
    id: 'res3',
    title: 'Project Management Fundamentals',
    type: 'course',
    duration: '3 hours',
    level: 'Beginner',
    provider: 'Collab Mind Academy',
    thumbnail: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=400&h=250&fit=crop',
    url: '#'
  },
  {
    id: 'res4',
    title: 'Agile Methodologies for Student Teams',
    type: 'webinar',
    duration: '1 hour',
    level: 'Intermediate',
    provider: 'Collab Mind Academy',
    thumbnail: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=250&fit=crop',
    url: '#'
  },
];

export default function Certificates() {
  const { user, certificates } = useStore();
  const [activeTab, setActiveTab] = useState<'earned' | 'resources'>('earned');
  const [filter, setFilter] = useState<'all' | 'completion' | 'excellence' | 'innovation'>('all');

  if (!user) return null;

  const userCertificates = certificates.filter(c => c.userId === user.id);
  const filteredCertificates = filter === 'all' 
    ? userCertificates 
    : userCertificates.filter(c => c.type === filter);

  const getCertificateIcon = (type: string) => {
  switch (type) {
    case 'excellence': return <Trophy className="w-6 h-6 text-white" />;
    case 'innovation': return <Star className="w-6 h-6 text-white" />;
    default: return <Award className="w-6 h-6 text-white" />;
  }
};

  const getCertificateColor = () => {
  return 'from-orange-500 to-orange-400';
};

  const stats = [
    { label: 'Total Certificates', value: userCertificates.length, icon: Award },
    { label: 'Excellence Awards', value: userCertificates.filter(c => c.type === 'excellence').length, icon: Trophy },
    { label: 'Innovation Awards', value: userCertificates.filter(c => c.type === 'innovation').length, icon: Star },
  ];

  // Helper to render mini stars for the score layout
  const renderScoreStars = (score: number = 0) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star key={star} className={`w-3 h-3 ${score >= star ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Certificates & Learning</h1>
        <p className="text-gray-500">Your achievements and learning resources</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-50 border border-gray-200 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('earned')}
          className={`px-6 py-2 rounded-lg font-medium transition-all cursor-hover ${
            activeTab === 'earned' 
              ? 'bg-orange-500 text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-white'
          }`}
          >
          Earned Certificates
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-6 py-2 rounded-lg font-medium transition-all cursor-hover ${
            activeTab === 'resources' 
              ? 'bg-orange-500 text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-900 hover:bg-white'
          }`}
        >
          Free Resources
        </button>
      </div>

      {activeTab === 'earned' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 text-center"
              >
                <stat.icon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Filter */}
          {userCertificates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {(['all', 'completion', 'excellence', 'innovation'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-hover ${
                    filter === type
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-white border border-gray-200 hover:bg-orange-50 text-gray-600'
                  }`}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Certificates Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.length === 0 ? (
              <div className="col-span-full bg-white border border-gray-200 shadow-sm rounded-2xl p-12 text-center">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No certificates yet
                </h3>
                <p className="text-gray-500">
                  Complete projects to earn certificates
                </p>
              </div>
            ) : (
              filteredCertificates.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
                >
                  <div className={`h-2 bg-gradient-to-r ${getCertificateColor()}`} />
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getCertificateColor()} flex items-center justify-center`}>
                        {getCertificateIcon(cert.type)}
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 border border-orange-100 text-orange-600">
                        {cert.type}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                      {cert.projectTitle}
                    </h3>
                    <p className="text-xs font-medium text-gray-400 mb-5">
                      Earned on {new Date(cert.earnedAt).toLocaleDateString()}
                    </p>

                    {/* --- NEW RATINGS SECTION --- */}
                    <div className="bg-gray-50 rounded-xl p-3 mb-6 space-y-2 border border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-600 uppercase">Completion</span>
                        {renderScoreStars(cert.completionScore)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-600 uppercase">Excellence</span>
                        {renderScoreStars(cert.excellenceScore)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-600 uppercase">Innovation</span>
                        {renderScoreStars(cert.innovationScore)}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <motion.button
                        className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-hover"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Download className="w-4 h-4" /> PDF
                      </motion.button>
                      <button className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-orange-500 transition-all cursor-hover shadow-sm">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'resources' && (
        <div className="grid md:grid-cols-2 gap-6">
          {freeResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${resource.thumbnail})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur text-white text-xs font-medium">
                    {resource.type}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {resource.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {resource.duration}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-500 font-medium">
                    {resource.level}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">{resource.provider}</span>
                  <motion.button
                    className="flex items-center gap-2 text-orange-500 font-bold cursor-hover"
                    whileHover={{ x: 5 }}
                  >
                    Start Learning <ExternalLink className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
