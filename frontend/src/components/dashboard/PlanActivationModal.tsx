import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check } from 'lucide-react';
import { useStore } from '../../store';

interface PlanActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanActivationModal({ isOpen, onClose }: PlanActivationModalProps) {
  const { updateUser, addNotification } = useStore();

  const handleUpgradePlan = async () => {
    try {
      await updateUser({ membership: 'premium' });
      addNotification('Premium plan activated successfully!', 'success');
      onClose();
    } catch (error) {
      addNotification('Failed to activate plan. Please try again.', 'error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-gray-200 shadow-2xl rounded-3xl p-8 max-w-md w-full relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-orange-500"></div>
            
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors">
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
  );
}
