/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';

/**
 * Heading component with gradient text
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Heading text
 * @param {string} props.as - HTML element to render (h1, h2, etc.)
 * @param {string} props.variant - Gradient variant: 'yellow-pink', 'orange-pink', 'blue-purple'
 * @param {boolean} props.animate - Whether to animate the heading
 * @param {string} props.className - Additional CSS classes
 */
const GradientHeading = ({
  children,
  as = 'h2',
  variant = 'yellow-pink',
  animate = false,
  className = '',
  ...rest
}) => {
  // Gradient styles based on variant
  const gradientStyles = {
    'yellow-pink': 'from-yellow-300 via-orange-300 to-pink-300',
    'orange-pink': 'from-orange-300 via-pink-300 to-purple-400',
    'blue-purple': 'from-blue-400 via-indigo-400 to-purple-400',
    'pink-orange': 'from-pink-400 to-orange-400'
  };

  // Determine which HTML tag to use
  const Component = animate ? motion[as] : as;
  
  // Animation props
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  } : {};

  return (
    <Component
      className={`bg-clip-text text-transparent bg-gradient-to-r ${gradientStyles[variant]} ${className}`}
      {...animationProps}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default GradientHeading;