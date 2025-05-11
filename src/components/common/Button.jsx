/* eslint-disable react/prop-types */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Reusable Button component that supports different variants and can be rendered as a button or Link
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Button style variant: 'primary', 'secondary', 'outline', or 'text'
 * @param {string} props.to - If provided, renders as a Link component to this path
 * @param {string} props.href - If provided, renders as an anchor tag to this URL
 * @param {string} props.size - Size of the button: 'sm', 'md', 'lg'
 * @param {boolean} props.fullWidth - Whether the button should take full width
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.icon - Optional icon to display alongside text
 * @param {string} props.iconPosition - Position of the icon: 'left' or 'right'
 * @param {function} props.onClick - Click handler
 */
const Button = ({
  variant = 'primary',
  to,
  href,
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  icon,
  iconPosition = 'right',
  onClick,
  ...rest
}) => {
  // Define base styles
  const baseStyles = "font-medium rounded-full transition-all transform hover:scale-105";
  
  // Size variations
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };
  
  // Variant styles
  const variantStyles = {
    primary: "bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg",
    secondary: "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg",
    outline: "bg-transparent border-2 border-white text-white hover:bg-white/10",
    text: "bg-transparent text-white hover:text-pink-400",
    white: "bg-white text-purple-700 hover:bg-gray-100 shadow-lg"
  };

  const widthStyles = fullWidth ? "w-full" : "";
  
  // Combine all styles
  const buttonStyles = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyles} ${className}`;
  
  // Content with icon
  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </>
  );

  // Render as motion component with appropriate element type
  const MotionComponent = motion[to ? "div" : href ? "a" : "button"];
  
  // Render the appropriate element based on props
  if (to) {
    return (
      <MotionComponent 
        className={buttonStyles}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        {...rest}
      >
        <Link to={to} className="inline-flex items-center justify-center">
          {content}
        </Link>
      </MotionComponent>
    );
  }
  
  if (href) {
    return (
      <MotionComponent 
        href={href}
        className={buttonStyles}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        {...rest}
      >
        <span className="inline-flex items-center justify-center">
          {content}
        </span>
      </MotionComponent>
    );
  }
  
  return (
    <MotionComponent 
      className={buttonStyles}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      {...rest}
    >
      <span className="inline-flex items-center justify-center">
        {content}
      </span>
    </MotionComponent>
  );
};

export default Button;