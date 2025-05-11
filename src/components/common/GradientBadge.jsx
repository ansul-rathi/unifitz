/* eslint-disable react/prop-types */

import { motion } from 'framer-motion';

/**
 * A component for displaying a badge with gradient background
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Badge content
 * @param {string} props.variant - Color variant: 'pink', 'purple', 'orange', 'blue'
 * @param {boolean} props.animate - Whether to animate the badge
 * @param {string} props.className - Additional CSS classes
 */
const GradientBadge = ({
  children,
  variant = 'pink',
  animate = false,
  className = '',
  ...rest
}) => {
  // Gradient styles based on variant
  const gradientStyles = {
    pink: 'from-pink-500 to-purple-600',
    orange: 'from-yellow-400 to-orange-500',
    purple: 'from-purple-500 to-blue-500',
    blue: 'from-blue-500 to-indigo-500',
    mixed: 'from-pink-500 to-orange-500'
  };

  // Component to render based on animation prop
  const Component = animate ? motion.span : 'span';
  
  // Animation props for motion component
  const animationProps = animate ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 }
  } : {};

  return (
    <Component
      className={`inline-block px-4 py-2 bg-gradient-to-r ${gradientStyles[variant]} rounded-full mb-4 shadow-lg ${className}`}
      {...animationProps}
      {...rest}
    >
      <span className="text-white font-medium">{children}</span>
    </Component>
  );
};

export default GradientBadge;