import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { 
  Search, Filter, Users, Calendar, Clock, Send, X,
  Lightbulb, CheckCircle, FileText, Sparkles, Check
} from 'lucide-react';
import CMVCReportModal from './CMVCReportModal';

export default function BrowseIdeas() {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [pendingIdea, setPendingIdea] = useState<typeof ideas[0] | null>(null);
  
  // NEW STATE: For viewing the report
  const [viewReportIdea, setViewReportIdea] = useState<typeof ideas[0] | null>(null);

  const { user, ideas, requests, addRequest, addNotification, setProfileToView, updateUser } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_review'>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<typeof ideas[0] | null>(null);
  const [requestAnswer, setRequestAnswer] = useState('');

  if (!user) return null;

  if (user.role === 'owner') {
    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-12 text-center">
        <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Problem Owners cannot browse ideas
        </h2>
        <p className="text-gray-500">
          Builders can browse and join projects. Owners can manage their ideas in "My Ideas".
        </p>
      </div>
    );
  }

  // Find ideas where the user has an approved or rejected request to hide them
  const hiddenIdeaIds = requests
    .filter(r => r.requesterId === user.id && (r.status === 'approved' || r.status === 'rejected'))
    .map(r => r.ideaId);

  const availableIdeas = ideas.filter((idea) => {
    return (
      idea.isPublished &&
      (idea.status === 'open' || idea.status === 'in_review') &&
      idea.userId !== user.id &&
      !hiddenIdeaIds.includes(idea.id)
    );
  });

  const filteredIdeas = availableIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase()) ||
      idea.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const hasRequested = (ideaId: string) => requests.some(r => r.ideaId === ideaId && r.requesterId === user.id);

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdea || !requestAnswer.trim()) return;

    addRequest({
      ideaId: selectedIdea.id,
      ideaTitle: selectedIdea.title,
      requesterId: user.id,
      requesterName: user.displayName,
      ownerId: selectedIdea.userId,
      answer: requestAnswer,
    });

    addNotification('Collaboration request sent!', 'success');
    setShowRequestModal(false);
    setSelectedIdea(null);
    setRequestAnswer('');
  };

  const openRequestModal = (idea: typeof ideas[0]) => {
    setPendingIdea(idea);
    setShowTermsModal(true);
  };

  const handleViewReportClick = (idea: typeof ideas[0]) => {
    if (user.membership !== 'premium') {
      setShowPlanModal(true);
    } else {
      if (idea.cmvcReport) {
        setViewReportIdea(idea);
      } else {
        addNotification('This idea was created before CMVC validation was available.', 'info');
      }
    }
  };

  const handleUpgradePlan = () => {
    updateUser({ membership: 'premium' });
    addNotification('Plan successfully activated! You now have Premium access.', 'success');
    setShowPlanModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Ideas</h1>
        <p className="text-gray-500">Find projects that match your skills and interests</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-900 placeholder-gray-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm focus:border-orange-500 outline-none transition-all text-gray-900"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_review">In Review</option>
        </select>
      </div>

      {/* Ideas Count */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Lightbulb className="w-4 h-4" />
        {filteredIdeas.length} ideas available
      </div>

      {/* --- CMVC REPORT VIEWER (For Premium Builders) --- */}
      <AnimatePresence>
        {viewReportIdea && viewReportIdea.cmvcReport && (
          <CMVCReportModal
            ideaTitle={viewReportIdea.title}
            ideaDescription={viewReportIdea.description}
            viewOnly={true}
            reportData={viewReportIdea.cmvcReport}
            onClose={() => setViewReportIdea(null)}
          />
        )}
      </AnimatePresence>

      {/* --- PLAN GATE MODAL --- */}
      <AnimatePresence>
        {showPlanModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPlanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-gray-200 shadow-2xl rounded-3xl p-8 max-w-md w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-500"></div>
              
              <button onClick={() => setShowPlanModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6 mt-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Required</h2>
                <p className="text-gray-500 text-sm">
                  You need to be on a Premium Plan to view detailed problem reports and analytics.
                </p>
              </div>

              {/* Mock Plan Card */}
              <div className="border-2 border-orange-500 rounded-2xl p-5 mb-6 bg-orange-50/50 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  100% OFF PROMO
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-1">Premium Access</h3>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-black text-gray-400 line-through decoration-red-500/50">$49</span>
                  <span className="text-4xl font-black text-orange-500">$0</span>
                  <span className="text-gray-500 font-medium mb-1">/month</span>
                </div>
                
                <ul className="space-y-2 mb-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <Check className="w-4 h-4 text-orange-500" /> View Full Idea Reports
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <Check className="w-4 h-4 text-orange-500" /> Priority Collaboration Requests
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <Check className="w-4 h-4 text-orange-500" /> Advanced Analytics
                  </li>
                </ul>
              </div>

              <motion.button
                onClick={handleUpgradePlan}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-xl shadow-md cursor-hover transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Activate Free Plan
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 shadow-2xl rounded-2xl p-8 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Collaboration Terms
            </h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              By joining this project you agree that the idea and final ownership
              belong to the problem owner. Your role is as a collaborator or builder.
              After completion of the project you cannot claim the project as your
              own independent idea or product.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowTermsModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-colors font-medium cursor-hover"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowTermsModal(false);
                  setSelectedIdea(pendingIdea);
                  setShowRequestModal(true);
                }}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors font-medium cursor-hover"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && selectedIdea && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => { setShowRequestModal(false); setSelectedIdea(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white border border-gray-200 shadow-2xl rounded-3xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Request Collaboration</h2>
                <button onClick={() => { setShowRequestModal(false); setSelectedIdea(null); }} className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg cursor-hover transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2">{selectedIdea.title}</h3>
                <p className="text-sm text-gray-600 mb-3">Expected from collaborators: {selectedIdea.expectations}</p>
              </div>

              <form onSubmit={handleRequest}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Why should they choose you? *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={requestAnswer}
                    onChange={(e) => setRequestAnswer(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none text-gray-900 placeholder-gray-400"
                    placeholder="Describe your skills, experience, and why you're a good fit for this project..."
                  />
                </div>

                <div className="flex gap-4">
                  <motion.button
                    type="submit"
                    className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold rounded-xl btn-shine cursor-hover flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="w-5 h-5" /> Send Request
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ideas List */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredIdeas.length === 0 ? (
          <div className="col-span-2 bg-white border border-gray-200 shadow-sm rounded-2xl p-12 text-center">
            <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No ideas found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredIdeas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 card-3d flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    idea.status === 'in_review'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                      : 'bg-green-50 text-green-600 border-green-200'
                  }`}
                >
                  {idea.status === 'in_review' ? 'In Review' : 'Open'}
                </span>
                {hasRequested(idea.id) && (
                  <span className="flex items-center gap-1 text-xs font-medium text-orange-500">
                    <CheckCircle className="w-4 h-4" /> Requested
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3">{idea.title}</h3>
              <p className="text-gray-500 mb-4 line-clamp-3">{idea.description}</p>

              <div className="mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-sm text-orange-500 font-bold mb-1">Looking for:</p>
                <p className="text-sm text-gray-700">{idea.expectations}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {idea.userName}
                </span>
                {idea.dueDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Due: {new Date(idea.dueDate).toLocaleDateString()}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {new Date(idea.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Button Group */}
              <div className="mt-auto grid grid-cols-2 gap-3">
                {/* Request Button */}
                {hasRequested(idea.id) ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-400 cursor-not-allowed"
                  >
                    Request Sent
                  </button>
                ) : (
                  user.role === "builder" && (
                    <motion.button
                      onClick={() => openRequestModal(idea)}
                      className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold rounded-xl cursor-hover"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Request to Join
                    </motion.button>
                  )
                )}

                {/* View Report Button - TRIGGERS PLAN GATE */}
                <button
                  onClick={() => handleViewReportClick(idea)}
                  className="w-full py-3 bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 rounded-xl font-medium cursor-hover transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" /> View Report
                </button>

                {/* View Owner Button (Full width at bottom) */}
                <button
                  onClick={() =>
                    setProfileToView({
                      ...user,
                      id: idea.userId,
                      displayName: idea.userName,
                      bio: "",
                      skills: [],
                      role: "owner",
                      isVerified: true,
                      membership: "free",
                      joinDate: idea.createdAt,
                      problemsPosted: 0,
                      activeProjects: 0,
                      completedProjects: 0,
                      trustScore: 75,
                    })
                  }
                  className="col-span-2 px-4 py-3 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-500 rounded-xl font-medium cursor-hover transition-colors"
                >
                  View Owner
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}