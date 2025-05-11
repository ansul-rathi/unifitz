/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import StarRating from './StarRating';

/**
 * Component for displaying a customer testimonial
 * 
 * @param {Object} props - Component props
 * @param {string} props.quote - Testimonial quote
 * @param {string} props.name - Customer name
 * @param {string} props.title - Customer title or membership info
 * @param {string} props.avatar - Avatar image URL
 * @param {number} props.rating - Star rating (1-5)
 * @param {string} props.variant - Color variant for the card border
 */
const TestimonialCard = ({
  quote,
  name,
  title,
  avatar,
  rating = 5,
  variant = 'pink',
  ...rest
}) => {
  // Border gradient variants
  const borderVariants = {
    pink: 'from-pink-500 to-orange-500',
    purple: 'from-purple-500 to-blue-500',
    orange: 'from-yellow-400 to-orange-500'
  };

  // Avatar border variants
  const avatarBorderVariants = {
    pink: 'border-pink-500',
    purple: 'border-purple-500',
    orange: 'border-orange-500'
  };

  // Title color variants
  const titleColorVariants = {
    pink: 'text-pink-300',
    purple: 'text-purple-300',
    orange: 'text-orange-300'
  };

  return (
    <motion.div 
      className={`p-1 bg-gradient-to-br ${borderVariants[variant]} rounded-3xl`}
      {...rest}
    >
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl h-full">
        <StarRating rating={rating} className="mb-6" />
        
        <p className="text-white text-lg mb-8 italic">{quote}</p>
        
        <div className="flex items-center">
          <div className={`w-14 h-14 rounded-full overflow-hidden mr-4 border-2 ${avatarBorderVariants[variant]}`}>
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold text-white text-lg">{name}</p>
            <p className={titleColorVariants[variant]}>{title}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;