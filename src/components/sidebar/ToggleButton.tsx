import { motion } from 'framer-motion';
import { Activity, ChevronRight } from 'lucide-react';

interface ToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function ToggleButton({ isOpen, onClick }: ToggleButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`digicare-toggle-btn ${isOpen ? 'sidebar-open' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ x: 100 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      title={isOpen ? 'Close DigiCare' : 'Open DigiCare'}
    >
      {isOpen ? (
        <ChevronRight className="w-6 h-6 text-white" />
      ) : (
        <div className="flex items-center justify-center">
          <Activity className="w-6 h-6 text-white" />
        </div>
      )}
    </motion.button>
  );
}
