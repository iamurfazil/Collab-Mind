import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import type { CMVCReport } from '../../store'; 
import { 
  Lightbulb, Plus, Edit2, Trash2, Eye, EyeOff, 
  CheckCircle, Clock, Users, X, Save, Upload, FileText,
  FileEdit, ShieldCheck
} from 'lucide-react';
import CMVCReportModal from './CMVCReportModal';

export default function MyIdeas() {
  const [showOwnerDisclaimer, setShowOwnerDisclaimer] = useState(false);
  const [showCMVCReport, setShowCMVCReport] = useState(false);
  const [ideaToPublish, setIdeaToPublish] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [optForPatent, setOptForPatent] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<CMVCReport | null>(null); 
  
  const { user, ideas, addIdea, updateIdea, deleteIdea, addNotification } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Replaced 'open' with 'in_review'
  const [filter, setFilter] = useState<'all' | 'draft' | 'patent' | 'in_review' | 'in_progress' | 'completed'>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    researchFiles: [] as File[],
    isPublished: true, 
  });

  if (!user) return null;

  const userIdeas = (ideas || []).filter(i => i.userId === user.id);
  
  // Safely catch legacy 'open' statuses under the 'in_review' filter
  const filteredIdeas = filter === 'all' 
    ? userIdeas 
    : userIdeas.filter(i => {
        if (filter === 'in_review') return i.status === 'in_review' || i.status === 'open';
        return i.status === filter;
      });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, researchFiles: Array.from(e.target.files) });
    }
  };

  const handleSubmit = (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    
    if (isDraft) {
      if (editingId) {
        updateIdea(editingId, {
          title: formData.title,
          description: formData.description,
          isPublished: false,
          status: 'draft',
        });
        addNotification('Draft updated successfully!', 'success');
      } else {
        addIdea({
          userId: user.id,
          userName: user.displayName,
          title: formData.title,
          description: formData.description,
          status: 'draft',
          isPublished: false,
          collaborators: [],
          skills: [] 
        } as any);
        addNotification('Saved as draft!', 'success');
      }
      resetForm();
    } else {
      setIdeaToPublish({
        ...(editingId ? { id: editingId } : {}),
        userId: user.id,
        userName: user.displayName,
        title: formData.title,
        description: formData.description,
        researchFiles: formData.researchFiles,
      } as any);

      setShowForm(false);
      setShowCMVCReport(true);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', description: '', researchFiles: [], isPublished: true });
    setGeneratedReport(null);
    setOptForPatent(false);
  };

  const handleEdit = (idea: any) => {
    setFormData({
      title: idea.title,
      description: idea.description,
      researchFiles: [], 
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

  const togglePublish = (idea: any) => {
    if (!idea.isPublished) {
      setIdeaToPublish(idea);
      setShowCMVCReport(true);
    } else {
      updateIdea(idea.id, { isPublished: false, status: 'draft' });
      addNotification('Idea unpublished and saved as draft', 'info');
    }
  };

  const handleCMVCProceed = (report: CMVCReport) => {
    setGeneratedReport(report);
    setShowCMVCReport(false);
    setShowOwnerDisclaimer(true);
    setOptForPatent(false);
  };

  const handleCMVCEdit = () => {
    setShowCMVCReport(false);
    setShowForm(true);
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/20 text-gray-600',
    patent: 'bg-purple-500/20 text-purple-600',
    in_review: 'bg-green-500/20 text-green-500',
    open: 'bg-green-500/20 text-green-500', // Map legacy 'open' to match 'in_review' colors
    in_progress: 'bg-yellow-500/20 text-yellow-600',
    completed: 'bg-blue-500/20 text-blue-500',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Draft',
    patent: 'Patent',
    in_review: 'In Review',
    open: 'In Review', // Map legacy 'open' strings to 'In Review'
    in_progress: 'In Progress',
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
        {(['all', 'draft', 'patent', 'in_review', 'in_progress', 'completed'] as const).map((status) => (
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

              <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
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

                {/* Optional Research Files Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Research Files (Optional)
                  </label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-orange-500 hover:bg-orange-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group"
                  >
                    <input 
                      type="file" 
                      multiple 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900">Click to upload research documents</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOCX, or PPTX up to 10MB</p>
                    </div>
                  </div>
                  
                  {/* File List Preview */}
                  {formData.researchFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {formData.researchFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FileText className="w-4 h-4 text-orange-500" />
                            <span className="truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setFormData({
                              ...formData, 
                              researchFiles: formData.researchFiles.filter((_, idx) => idx !== i)
                            })}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-xl btn-shine cursor-hover flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save className="w-5 h-5" /> {editingId && ideaToPublish?.status !== 'draft' ? 'Update Idea' : 'Create & Validate'}
                  </motion.button>
                  
                  {/* DRAFT BUTTON */}
                  <motion.button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    className="flex-1 py-4 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all cursor-hover flex items-center justify-center gap-2 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FileEdit className="w-5 h-5" /> Save as Draft
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
            onProceed={handleCMVCProceed} 
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[idea.status] || statusColors.in_review}`}>
                      {statusLabels[idea.status] || idea.status}
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
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {idea.collaborators?.length || 0} collaborators
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Created {new Date(idea.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* EDIT BUTTON: Only show if status is 'draft' */}
                  {idea.status === 'draft' && (
                    <motion.button
                      onClick={() => handleEdit(idea)}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-orange-50 text-gray-600 hover:text-orange-500 cursor-hover"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Edit Draft"
                    >
                      <Edit2 className="w-5 h-5" />
                    </motion.button>
                  )}
                  
                  <motion.button
                    onClick={() => togglePublish(idea)}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-orange-50 text-gray-600 hover:text-orange-500 cursor-hover"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title={idea.isPublished ? "Unpublish and save as draft" : "Publish to marketplace"}
                  >
                    {idea.isPublished ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(idea.id)}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:bg-red-50 text-red-500 cursor-hover"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title="Delete Idea"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white shadow-2xl border border-gray-200 rounded-2xl p-8 max-w-lg w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Publishing Options
            </h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              By publishing this project you acknowledge that builders working on
              the project are independent collaborators. If a collaborator makes
              mistakes, fails to complete the work properly, or causes issues in
              implementation, the platform will not be responsible for those
              outcomes.
            </p>

            {/* Patent Option Toggle */}
            <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-4">
              <div className="mt-1 flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-purple-900">Protect my Idea (Patent)</h3>
                  <button
                    onClick={() => setOptForPatent(!optForPatent)}
                    className={`w-12 h-6 rounded-full transition-colors cursor-hover border relative flex items-center px-1 ${
                      optForPatent ? 'bg-purple-600 border-purple-600' : 'bg-gray-300 border-gray-300'
                    }`}
                  >
                    <motion.div
                      className="w-4 h-4 rounded-full bg-white shadow-sm"
                      animate={{ x: optForPatent ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
                <p className="text-xs text-purple-700 leading-relaxed">
                  Collab Mind will process your idea through our legal backend to begin the patent filing process before making it public.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowOwnerDisclaimer(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const finalStatus = optForPatent ? 'patent' : 'in_review';
                  
                  if ('id' in ideaToPublish && ideaToPublish.id) {
                    updateIdea(ideaToPublish.id, { 
                      title: ideaToPublish.title,
                      description: ideaToPublish.description,
                      isPublished: true,
                      status: finalStatus,
                      cmvcReport: generatedReport || undefined 
                    });
                  } else {
                    addIdea({
                      ...ideaToPublish,
                      isPublished: true,
                      status: finalStatus,
                      cmvcReport: generatedReport || undefined 
                    });
                  }
                  
                  if (optForPatent) {
                    addNotification('Idea published and sent for patenting securely!', 'success');
                  } else {
                    addNotification('Idea published successfully', 'success');
                  }

                  setIdeaToPublish(null);
                  setShowOwnerDisclaimer(false);
                  setGeneratedReport(null);
                  resetForm();
                }}
                className={`flex-1 py-3 text-white rounded-xl font-medium transition-colors ${
                  optForPatent ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {optForPatent ? 'Patent & Publish' : 'Accept & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}