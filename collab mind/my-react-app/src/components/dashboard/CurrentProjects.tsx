import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import ProjectCard from './ProjectCard';
import UpdateStatusModal from './UpdateStatusModal';
import { FolderKanban, CheckCircle, Clock, Zap, Star, X, Award } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: string;
  systemStatus?: string; 
  completed: boolean;
  collaborators?: string[];
}

function ReviewModal({ 
  project, 
  onClose, 
  onSave 
}: { 
  project: Project; 
  onClose: () => void; 
  onSave: (scores: { completion: number; excellence: number; innovation: number }) => void;
}) {
  const [scores, setScores] = useState({ completion: 5, excellence: 5, innovation: 5 });

  const renderStars = (category: 'completion' | 'excellence' | 'innovation', label: string, desc: string) => (
    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex justify-between items-start mb-2">
        <div>
          <label className="block text-sm font-bold text-gray-900">{label}</label>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setScores({...scores, [category]: star})}
            className="focus:outline-none cursor-hover hover:scale-110 transition-transform"
          >
            <Star className={`w-8 h-8 ${scores[category] >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Review & Approve</h2>
              <p className="text-xs text-gray-500">Rate the builders' performance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <h3 className="font-bold text-gray-900 mb-4 line-clamp-1">{project.title}</h3>
          
          {renderStars('completion', 'Completion Score', 'Did the builder deliver all expected requirements?')}
          {renderStars('excellence', 'Excellence & Quality', 'Was the code/design/solution of high professional quality?')}
          {renderStars('innovation', 'Innovation & Creativity', 'Did they bring creative problem-solving to the table?')}

          <button
            onClick={() => onSave(scores)}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-hover mt-2"
          >
            Approve & Generate Certificates
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CurrentProjects() {
  const { user, ideas, updateIdea, addCertificate, addNotification } = useStore();
  const navigate = useNavigate();
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [projectToReview, setProjectToReview] = useState<Project | null>(null);

  if (!user) return null;

  const userProjects = ideas.filter(
    idea =>
      idea.userId === user.id ||
      idea.collaborators.includes(user.id)
  );

  const currentProjects = userProjects.filter(
    idea => idea.status === "in_review" || idea.status === "pending_review"
  );

  const completedProjects = userProjects.filter(
    idea => idea.status === "completed"
  );

  const handleUpdateProject = (projectId: string, progress: number, status: string) => {
    updateIdea(projectId, {
      progress: progress,
      projectStatus: status,
      status: progress === 100 ? "pending_review" : "in_review"
    });

    if (progress === 100) {
      addNotification('Project sent to owner for final review!', 'success');
    } else {
      addNotification('Project progress updated!', 'success');
    }
    
    setShowModal(false);
    setSelectedProject(null);
  };

  const handleApproveProject = (scores: { completion: number; excellence: number; innovation: number }) => {
    if (!projectToReview) return;

    updateIdea(projectToReview.id, {
      status: "completed",
      progress: 100,
      projectStatus: "Successfully Completed & Reviewed"
    });

    const idea = ideas.find(i => i.id === projectToReview.id);

    // --- NEW LOGIC: Determine the primary certificate type based on the Owner's ratings ---
    let determinedType: 'completion' | 'excellence' | 'innovation' = 'completion';
    
    if (scores.innovation === 5) {
      determinedType = 'innovation';
    } else if (scores.excellence >= 4) {
      determinedType = 'excellence';
    }

    if (idea && idea.collaborators) {
      idea.collaborators.forEach(collabId => {
        addCertificate({
          userId: collabId,
          projectId: idea.id,
          projectTitle: idea.title,
          earnedAt: new Date().toISOString(),
          type: determinedType, // Pass the dynamically calculated type here!
          completionScore: scores.completion,
          excellenceScore: scores.excellence,
          innovationScore: scores.innovation
        });
      });
    }

    addNotification(`Project approved! Awarded ${determinedType} certificates.`, 'success');
    setProjectToReview(null);
  };

  const openUpdateModal = (project: Project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  const openReviewModal = (project: Project) => {
    setProjectToReview(project);
  };

  const handleEnterWorkspace = (projectId: string) => {
    navigate(`/dashboard/workspace/${projectId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Current Projects</h1>
        <p className="text-gray-500">Track and manage your active collaborations</p>
      </motion.div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold gradient-text">{currentProjects.length}</div>
            <div className="text-sm font-medium text-gray-500">Active Projects</div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-green-500">{completedProjects.length}</div>
            <div className="text-sm font-medium text-gray-500">Completed</div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-500">0%</div>
            <div className="text-sm font-medium text-gray-500">Avg. Progress</div>
          </div>
        </motion.div>
      </div>

      {/* Current Projects Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <FolderKanban className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold text-gray-900">In Progress</h2>
        </div>
        
        {currentProjects.length === 0 ? (
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-12 text-center">
            <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No active projects</h3>
            <p className="text-gray-500">Browse ideas and collaborate to start a project</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentProjects.map((idea, index) => (
              <ProjectCard
                key={idea.id}
                project={{
                  id: idea.id,
                  title: idea.title,
                  description: idea.description,
                  progress: idea.progress ?? 0,
                  status: idea.projectStatus ?? "Project started",
                  systemStatus: idea.status, 
                  completed: idea.status === "completed",
                  collaborators: idea.collaborators
                }}
                index={index}
                onUpdateStatus={() =>
                  openUpdateModal({
                    id: idea.id,
                    title: idea.title,
                    description: idea.description,
                    progress: 0,
                    status: idea.status,
                    completed: false
                  })
                }
                onEnterWorkspace={() => handleEnterWorkspace(idea.id)}
                // @ts-ignore
                onReviewProject={() => openReviewModal({
                  id: idea.id,
                  title: idea.title,
                  description: idea.description,
                  progress: idea.progress ?? 0,
                  status: idea.status,
                  completed: false
                })}
              />
            ))}
          </div>
        )}
      </motion.section>

      {/* Completed Projects Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h2 className="text-xl font-bold text-gray-900">Completed</h2>
        </div>
        
        {completedProjects.length === 0 ? (
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No completed projects yet</h3>
            <p className="text-gray-500">Complete your first project to see it here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedProjects.map((idea, index) => (
              <ProjectCard
                key={idea.id}
                project={{
                  id: idea.id,
                  title: idea.title,
                  description: idea.description,
                  progress: 100,
                  status: "Completed",
                  completed: true
                }}
                index={index}
                onUpdateStatus={() => {}}
                onEnterWorkspace={() => handleEnterWorkspace(idea.id)} 
              />
            ))}
          </div>
        )}
      </motion.section>

      {/* Update Status Modal */}
      {showModal && selectedProject && (
        <UpdateStatusModal
          project={selectedProject}
          onClose={() => {
            setShowModal(false);
            setSelectedProject(null);
          }}
          onSave={handleUpdateProject}
        />
      )}

      {/* Owner Review Modal */}
      <AnimatePresence>
        {projectToReview && (
          <ReviewModal 
            project={projectToReview} 
            onClose={() => setProjectToReview(null)} 
            onSave={handleApproveProject} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}