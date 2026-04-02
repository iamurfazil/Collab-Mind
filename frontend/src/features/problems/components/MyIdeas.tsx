import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store';
import type { CMVCReport } from '../../store'; // <-- FIX: Added 'type' keyword
import { 
  Lightbulb, Plus, Edit2, Trash2, Eye, EyeOff, 
  CheckCircle, Clock, Users, X, Save
} from 'lucide-react';
import CMVCReportModal from './CMVCReportModal';

export default function MyIdeas() {
  const [showOwnerDisclaimer, setShowOwnerDisclaimer] = useState(false);
  const [showCMVCReport, setShowCMVCReport] = useState(false);
  const [ideaToPublish, setIdeaToPublish] = useState<typeof ideas[0] | null>(null);
  
  // NEW STATE: Store the generated report to save it later
  const [generatedReport, setGeneratedReport] = useState<CMVCReport | null>(null); 
  
  const { user, ideas, addIdea, updateIdea, deleteIdea, addNotification } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_review' | 'completed'>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expectations: '',
    isPublished: true,
  });

  if (!user) return null;

  const userIdeas = ideas.filter(i => i.userId === user.id);
  const filteredIdeas = filter === 'all' ? userIdeas : userIdeas.filter(i => i.status === filter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.isPublished) {
      setIdeaToPublish({
        ...(editingId ? { id: editingId } : {}),
        userId: user.id,
        userName: user.displayName,
        ...formData,
        status: 'open',
      } as any);

      setShowForm(false);
      setShowCMVCReport(true);
    } else {
      if (editingId) {
        updateIdea(editingId, {
          ...formData,
        });
        addNotification('Idea updated successfully!', 'success');
      } else {
        addIdea({
          userId: user.id,
          userName: user.displayName,
          ...formData,
          status: 'open',
        });
        addNotification('Idea created successfully!', 'success');
      }
      resetForm();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', description: '', expectations: '', isPublished: true });
    setGeneratedReport(null);
  };

  const handleEdit = (idea: typeof ideas[0]) => {
    setFormData({
      title: idea.title,
      description: idea.description,
      expectations: idea.expectations,
      isPublished: idea.isPublished,
    });
    setEditingId(idea.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this idea?')) {
      deleteIdea(id);
      addNotification('Idea deleted', 'info');
    }
  };

  const togglePublish = (idea: typeof ideas[0]) => {
    if (!idea.isPublished) {
      setIdeaToPublish(idea);
      setShowCMVCReport(true);
    } else {
      updateIdea(idea.id, { isPublished: false });
      addNotification('Idea unpublished', 'info');
    }
  };

  // UPDATE: Accept the report from the modal
  const handleCMVCProceed = (report: CMVCReport) => {
    setGeneratedReport(report);
    setShowCMVCReport(false);
    setShowOwnerDisclaimer(true);
  };

  const handleCMVCEdit = () => {
    setShowCMVCReport(false);
    setShowForm(true);
  };

  const statusColors = {
    open: 'bg-green-500/20 text-green-500',
    in_review: 'bg-yellow-500/20 text-yellow-500',
    completed: 'bg-blue-500/20 text-blue-500',
  };

  const statusLabels = {
    open: 'Open',
    in_review: 'In Review',
    completed: 'Completed',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Ideas</h1>
          <p className="text-gray-500">Manage your problem statements and projects</p>
        </div>
        <motion.button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-xl btn-shine cursor-hover"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" /> New Idea
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'open', 'in_review', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-hover ${
              filter === status
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-gray-200 hover:bg-orange-50 text-gray-600'
            }`}
          >
            {status === 'all' ? 'All' : statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white border border-gray-200 shadow-2xl rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Idea' : 'Create New Idea'}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg cursor-hover">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
                    placeholder="e.g., AI-Powered Study Companion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none text-gray-900 placeholder-gray-400"
                    placeholder="Describe your problem or idea in detail..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Expectations from Collaborators *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.expectations}
                    onChange={(e) => setFormData({ ...formData, expectations: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none text-gray-900 placeholder-gray-400"
                    placeholder="What skills and experience are you looking for?"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="isPublished" className="text-sm text-gray-600">
                      Publish immediately (visible to builders)
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-xl btn-shine cursor-hover flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="w-5 h-5" /> {editingId ? 'Update Idea' : 'Create Idea'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium cursor-hover text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CMVC Report Modal */}
      <AnimatePresence>
        {showCMVCReport && ideaToPublish && (
          <CMVCReportModal
            ideaTitle={ideaToPublish.title}
            ideaDescription={ideaToPublish.description}
            onProceed={handleCMVCProceed} // Now receives the report
            onEdit={handleCMVCEdit}
          />
        )}
      </AnimatePresence>

      {/* Ideas List */}
      <div className="grid gap-4">
        {filteredIdeas.length === 0 ? (
          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-12 text-center">
            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No ideas yet</h3>
            <p className="text-gray-500 mb-4">Create your first idea to get started</p>
            <motion.button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl cursor-hover"
              whileHover={{ scale: 1.02 }}
            >
              <Plus className="w-5 h-5" /> Create Idea
            </motion.button>
          </div>
        ) : (
          filteredIdeas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 card-3d"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[idea.status as keyof typeof statusColors] || statusColors.open}`}>
                      {statusLabels[idea.status as keyof typeof statusLabels] || 'Open'}
                    </span>
                    {idea.isPublished ? (
                      <span className="flex items-center gap-1 text-xs text-green-500">
                        <Eye className="w-3 h-3" /> Published
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <EyeOff className="w-3 h-3" /> Draft
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{idea.title}</h3>
                  <p className="text-gray-500 mb-3 line-clamp-2">{idea.description}</p>
                  <p className="text-sm text-orange-500 mb-3">Expectations: {idea.expectations}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {idea.collaborators.length} collaborators
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Created {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={() => handleEdit(idea)}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-orange-50 text-gray-600 hover:text-orange-500 cursor-hover"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => togglePublish(idea)}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-orange-50 text-gray-600 hover:text-orange-500 cursor-hover"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {idea.isPublished ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(idea.id)}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-red-50 text-red-500 cursor-hover"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {showOwnerDisclaimer && ideaToPublish && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white shadow-2xl border border-gray-200 rounded-2xl p-8 max-w-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Owner Responsibility Notice
            </h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              By publishing this project you acknowledge that builders working on
              the project are independent collaborators. If a collaborator makes
              mistakes, fails to complete the work properly, or causes issues in
              implementation, the platform will not be responsible for those
              outcomes.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowOwnerDisclaimer(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if ('id' in ideaToPublish && ideaToPublish.id) {
                    updateIdea(ideaToPublish.id, { 
                      title: ideaToPublish.title,
                      description: ideaToPublish.description,
                      expectations: ideaToPublish.expectations,
                      isPublished: true,
                      cmvcReport: generatedReport || undefined // Save the report!
                    });
                  } else {
                    addIdea({
                      ...ideaToPublish,
                      isPublished: true,
                      cmvcReport: generatedReport || undefined // Save the report!
                    });
                  }
                  setIdeaToPublish(null);
                  setShowOwnerDisclaimer(false);
                  setGeneratedReport(null);
                  addNotification('Idea published successfully', 'success');
                  resetForm();
                }}
                className="flex-1 py-3 bg-orange-500 text-white rounded-xl"
              >
                Accept & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
