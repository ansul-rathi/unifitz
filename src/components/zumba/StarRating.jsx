/* eslint-disable react/prop-types */

/**
 * Component for displaying star ratings
 * 
 * @param {Object} props - Component props
 * @param {number} props.rating - Rating value (1-5)
 * @param {number} props.maxStars - Maximum number of stars to display
 * @param {string} props.color - Star color
 * @param {string} props.size - Star size (sm, md, lg)
 * @param {string} props.className - Additional CSS classes
 */
const StarRating = ({
  rating = 5,
  maxStars = 5,
  color = 'text-yellow-300',
  size = 'md',
  className = '',
  ...rest
}) => {
  // Size styles
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className={`flex items-center ${className}`} {...rest}>
      {[...Array(maxStars)].map((_, i) => (
        <svg 
          key={i} 
          className={`${sizeClasses[size]} ${color}`} 
          fill={i < rating ? 'currentColor' : 'none'} 
          stroke={i < rating ? 'none' : 'currentColor'}
          strokeWidth={1.5}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default StarRating;