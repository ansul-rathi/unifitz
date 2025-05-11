/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import { Calendar, Zap } from 'lucide-react';

/**
 * Component for displaying a Zumba class card
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Class title
 * @param {string} props.level - Difficulty level
 * @param {string} props.description - Class description
 * @param {string} props.days - Days class is offered
 * @param {string} props.time - Time class is offered
 * @param {string} props.badgeVariant - Gradient variant for the level badge
 */
const ClassCard = ({
  title,
  level,
  description,
  days,
  time,
  badgeVariant = 'pink',
  ...rest
}) => {
  // Badge color variants
  const badgeColors = {
    pink: 'from-pink-500 to-orange-500',
    purple: 'from-purple-500 to-blue-500',
    yellow: 'from-yellow-400 to-orange-500'
  };

  // Border hover colors
  const borderHoverColors = {
    pink: 'hover:border-pink-500/50',
    purple: 'hover:border-purple-500/50',
    yellow: 'hover:border-yellow-500/50'
  };

  return (
    <motion.div 
      className={`bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 ${borderHoverColors[badgeVariant]} transition-all`}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      {...rest}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <span className={`px-3 py-1 bg-gradient-to-r ${badgeColors[badgeVariant]} rounded-full text-sm font-medium text-white`}>
          {level}
        </span>
      </div>
      <p className="text-white/80 mb-4">{description}</p>
      <div className="flex justify-between text-sm text-yellow-300 items-center">
        <span className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" /> {days}
        </span>
        <span className="flex items-center">
          <Zap className="h-4 w-4 mr-1" /> {time}
        </span>
      </div>
    </motion.div>
  );
};

export default ClassCard;