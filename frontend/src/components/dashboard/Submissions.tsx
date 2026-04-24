import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { 
  FileText, Clock, CheckCircle, AlertCircle, Calendar, 
  Users, ShieldCheck, PlayCircle
} from 'lucide-react';

export default function Submissions() {
  const { user, ideas, requests } = useStore();
  // UPDATED: Added new statuses to the filter state
  const [filter, setFilter] = useState<'all' | 'draft' | 'in_patent' | 'open' | 'in_progress' | 'completed'>('all');

  if (!user) return null;

  const userSubmissions = user.role === 'owner'
    ? (ideas || []).filter(i => i.userId === user.id) 
    : (ideas || []).filter(i => (i.collaborators || []).includes(user.id)); 

  const approvedRequests = (requests || []).filter(r => r.requesterId === user.id && r.status === 'approved');
  
  const submissions = userSubmissions.map(idea => {
    const request = approvedRequests.find(r => r.ideaId === idea.id);
    return {
      ...idea,
      joinedAt: request?.createdAt || idea.createdAt,
      role: idea.userId === user.id ? 'Owner' : 'Collaborator',
    };
  });

  // Handle 'in_review' fallback to 'in_progress' for legacy data filtering
  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter(s => s.status === filter || (filter === 'in_progress' && s.status === 'in_review'));

  // UPDATED: Added all new statuses mapping to match MyIdeas.tsx
  const statusConfig: Record<string, any> = {
    draft: { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-50 border border-gray-200', label: 'Draft' },
    in_patent: { icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50 border border-purple-200', label: 'In Patent' },
    open: { icon: Clock, color: 'text-green-600', bg: 'bg-green-50 border border-green-200', label: 'Open' },
    in_progress: { icon: PlayCircle, color: 'text-yellow-600', bg: 'bg-yellow-50 border border-yellow-200', label: 'In Progress' },
    in_review: { icon: PlayCircle, color: 'text-yellow-600', bg: 'bg-yellow-50 border border-yellow-200', label: 'In Progress' }, // Fallback for old data
    completed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50 border border-blue-200', label: 'Completed' },
  };

  // UPDATED: Count in_progress and in_review together to prevent counting bugs
  const stats = [
    { label: 'Total Projects', value: submissions.length, color: 'from-orange-500 to-orange-400' },
    { label: 'In Progress', value: submissions.filter(s => s.status === 'in_progress' || s.status === 'in_review').length, color: 'from-yellow-400 to-yellow-600' },
    { label: 'Completed', value: submissions.filter(s => s.status === 'completed').length, color: 'from-blue-400 to-blue-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
        <p className="text-gray-500">Track your contributions to projects</p>
      </div>

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
            <div className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm font-medium text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'draft', 'in_patent', 'open', 'in_progress', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-hover ${
              filter === status
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 hover:bg-orange-50 text-gray-600'
            }`}
          >
            {status === 'all' ? 'All' : statusConfig[status]?.label || status}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      <div className="grid gap-4">
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No submissions yet</h3>
            <p className="text-gray-500">
              {user.role === 'owner' 
                ? 'Create your first idea to start a project'
                : 'Request to collaborate on ideas to see them here'}
            </p>
          </div>
        ) : (
          filteredSubmissions.map((submission, index) => {
            // SAFETY FALLBACK: If status is somehow unknown, default to a gray generic tag
            const config = statusConfig[submission.status] || { 
              icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50 border border-gray-200', label: submission.status 
            };
            
            return (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 card-3d"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 border border-orange-200 text-orange-600">
                        {submission.role}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {submission.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {submission.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined: {new Date(submission.joinedAt || Date.now()).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {submission.collaborators?.length || 0} collaborators
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {submission.status === 'completed' && (
                      <span className="flex items-center gap-2 font-medium text-blue-600">
                        <CheckCircle className="w-5 h-5" /> Completed
                      </span>
                    )}
                    {(submission.status === 'in_progress' || submission.status === 'in_review') && (
                      <span className="flex items-center gap-2 font-medium text-yellow-600">
                        <PlayCircle className="w-5 h-5" /> In Progress
                      </span>
                    )}
                    {submission.status === 'in_patent' && (
                      <span className="flex items-center gap-2 font-medium text-purple-600">
                        <ShieldCheck className="w-5 h-5" /> In Patent
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}