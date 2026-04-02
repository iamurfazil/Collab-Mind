import { useStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export default function Toast() {
  const { notifications, darkMode } = useStore();
  
  return (
    <div className="fixed top-4 right-4 z-[10000] space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`flex items-center gap-3 px-4 py-4 rounded-xl shadow-xl bg-white border-l-4 ${
              notification.type === 'success' 
                ? 'border-green-500' 
                : notification.type === 'error'
                ? 'border-red-500'
                : 'border-blue-500'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
            {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            <span className={`text-sm font-semibold text-gray-900`}>
              {notification.message}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}