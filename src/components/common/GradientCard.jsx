/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';

/**
 * A card component with gradient border and glass-like appearance
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.variant - Border gradient variant: 'pink', 'purple', 'orange', 'rainbow'
 * @param {boolean} props.hoverable - Whether the card has hover effects
 * @param {boolean} props.featured - Whether the card should be highlighted (scaled up)
 * @param {string} props.className - Additional CSS classes
 */
const GradientCard = ({
  children,
  variant = 'pink',
  hoverable = true,
  featured = false,
  className = '',
  ...rest
}) => {
  // Border gradient styles based on variant
  const borderGradients = {
    pink: 'from-pink-500 via-pink-600 to-pink-700',
    purple: 'from-purple-500 via-purple-600 to-purple-700', 
    orange: 'from-orange-500 via-orange-600 to-orange-700',
    rainbow: 'from-pink-500 via-purple-500 to-orange-500',
    blue: 'from-blue-500 via-blue-600 to-blue-700'
  };

  // Card scale for featured cards
  const scale = featured ? 'md:scale-110 z-10' : '';
  
  // Motion variants based on hoverable prop
  const variants = hoverable ? {
    initial: { y: 0 },
    hover: { y: -10 }
  } : {};

  return (
    <motion.div 
      className={`rounded-3xl overflow-hidden shadow-2xl ${scale} ${className}`}
      variants={variants}
      initial="initial"
      whileHover={hoverable ? "hover" : undefined}
      transition={{ duration: 0.3 }}
      {...rest}
    >
      <div className={`p-[3px] bg-gradient-to-r ${borderGradients[variant]} rounded-3xl`}>
        <div className="bg-gradient-to-b from-purple-900 to-purple-950 p-8 rounded-3xl h-full">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default GradientCard;