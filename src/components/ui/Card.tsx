import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, padding = 'md', hover = false, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={hover ? { scale: 1.01, y: -2 } : undefined}
      className={clsx(
        'bg-white rounded-xl border border-gray-100 shadow-sm',
        'transition-shadow duration-200',
        {
          'p-0': padding === 'none',
          'p-3': padding === 'sm',
          'p-4': padding === 'md',
          'p-6': padding === 'lg',
          'hover:shadow-md cursor-pointer': hover || onClick,
        },
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
