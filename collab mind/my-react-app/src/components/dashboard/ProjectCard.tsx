import { motion } from 'framer-motion';
import { Edit2, ArrowRight, Award, Clock } from 'lucide-react';
import { useStore } from '../../store';

interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: string;
  systemStatus?: string; // Added to check for pending_review
  completed: boolean;
  collaborators?: string[];
}

interface ProjectCardProps {
  project: Project;
  index: number;
  onUpdateStatus: () => void;
  onEnterWorkspace: () => void; 
  onReviewProject: () => void; // Added for the Owner's review flow
}

export default function ProjectCard({ project, index, onUpdateStatus, onEnterWorkspace, onReviewProject }: ProjectCardProps) {
  const { user } = useStore();
  
  // Determine user's role in this specific project
  const isBuilder = user && project.collaborators?.includes(user.id);
  const isOwner = user && !isBuilder; // In CurrentProjects, if you're not a collab, you're the owner
  const isPendingReview = project.systemStatus === 'pending_review';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 pr-2">{project.title}</h3>
        {project.completed && (
          <span className="text-green-600 bg-green-100 border border-green-200 px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wide flex-shrink-0">
            Completed
          </span>
        )}
        {!project.completed && isPendingReview && (
          <span className="text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wide flex items-center gap-1 flex-shrink-0">
            <Clock className="w-3 h-3" /> In Review
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm line-clamp-2">{project.description}</p>

      {/* Status */}
      <div className="text-sm">
        <span className="text-gray-500 font-medium">Status: </span>
        <span className="text-orange-500 font-bold">{project.status}</span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 font-medium">Progress</span>
          <span className={`font-bold ${project.completed ? 'text-green-600' : 'text-orange-500'}`}>
            {project.progress}%
          </span>
        </div>
        <div className="bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="pt-2 space-y-3">
        {/* Enter Workspace Button */}
        <motion.button
          onClick={onEnterWorkspace}
          className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-hover bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Enter Workspace <ArrowRight className="w-4 h-4" />
        </motion.button>

        {/* OWNER ONLY: Review & Approve Button */}
        {isOwner && isPendingReview && (
          <motion.button
            onClick={onReviewProject}
            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-hover bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm hover:from-green-600 hover:to-emerald-600 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Award className="w-4 h-4" /> Review & Approve
          </motion.button>
        )}

        {/* BUILDER ONLY: Update Status Button */}
        {isBuilder && (
          <motion.button
            onClick={onUpdateStatus}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-hover transition-colors shadow-sm ${
              project.completed || isPendingReview
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-orange-400 text-white border border-orange-400 hover:from-orange-600 hover:to-orange-500'
            }`}
            whileHover={project.completed || isPendingReview ? {} : { scale: 1.02 }}
            whileTap={project.completed || isPendingReview ? {} : { scale: 0.98 }}
            disabled={project.completed || isPendingReview}
          >
            <Edit2 className="w-4 h-4" />
            {project.completed 
              ? 'Project Completed' 
              : isPendingReview 
                ? 'Pending Owner Approval' 
                : 'Update Status'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}