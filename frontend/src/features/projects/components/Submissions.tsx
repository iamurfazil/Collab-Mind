import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store';
import { 
  FileText, Clock, CheckCircle, AlertCircle, Calendar, 
  Users, ArrowRight, Filter
} from 'lucide-react';

export default function Submissions() {
  const { user, ideas, requests } = useStore();
  const [filter, setFilter] = useState<'all' | 'open' | 'in_review' | 'completed'>('all');

  if (!user) return null;

  // Get user's submissions based on role
  const userSubmissions = user.role === 'owner'
    ? ideas.filter(i => i.userId === user.id) // Owner sees their own ideas
    : ideas.filter(i => i.collaborators.includes(user.id)); // Builder sees projects they're collaborating on

  const approvedRequests = requests.filter(r => r.requesterId === user.id && r.status === 'approved');
  
  // Merge submissions with collaboration info
  const submissions = userSubmissions.map(idea => {
    const request = approvedRequests.find(r => r.ideaId === idea.id);
    return {
      ...idea,
      joinedAt: request?.createdAt || idea.createdAt,
      role: idea.userId === user.id ? 'Owner' : 'Collaborator',
    };
  });

  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter(s => s.status === filter);

  const statusConfig = {
    open: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50 border border-yellow-200', label: 'Open' },
    in_review: { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50 border border-blue-200', label: 'In Review' },
    completed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border border-green-200', label: 'Completed' },
  };

  const stats = [
    { label: 'Total Projects', value: submissions.length, color: 'from-orange-500 to-orange-400' },
    { label: 'In Progress', value: submissions.filter(s => s.status === 'in_review').length, color: 'from-blue-400 to-blue-600' },
    { label: 'Completed', value: submissions.filter(s => s.status === 'completed').length, color: 'from-green-400 to-green-600' },
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
        {(['all', 'open', 'in_review', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-hover ${
              filter === status
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 hover:bg-orange-50 text-gray-600'
            }`}
          >
            {status === 'all' ? 'All' : statusConfig[status].label}
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
            const config = statusConfig[submission.status];
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
                        Joined: {new Date(submission.joinedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {submission.collaborators.length} collaborators
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {submission.status === 'completed' && (
                      <span className="flex items-center gap-2 font-medium text-green-600">
                        <CheckCircle className="w-5 h-5" /> Completed
                      </span>
                    )}
                    {submission.status === 'in_review' && (
                      <span className="flex items-center gap-2 font-medium text-blue-600">
                        <AlertCircle className="w-5 h-5" /> In Progress
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
