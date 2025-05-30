/* eslint-disable react/prop-types */

import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';

/**
 * Component for displaying a Yoga class card
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
  badgeVariant = 'purple',
  ...rest
}) => {
  // Badge color variants
  const badgeColors = {
    blue: 'from-blue-500 to-teal-500',
    purple: 'from-purple-500 to-indigo-500',
    indigo: 'from-indigo-500 to-blue-500',
    teal: 'from-teal-500 to-blue-400'
  };

  // Border hover colors
  const borderHoverColors = {
    blue: 'hover:border-blue-500/50',
    purple: 'hover:border-purple-500/50',
    indigo: 'hover:border-indigo-500/50',
    teal: 'hover:border-teal-500/50'
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
      <div className="flex justify-between text-sm text-blue-300 items-center">
        <span className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" /> {days}
        </span>
        <span className="flex items-center">
          <Clock className="h-4 w-4 mr-1" /> {time}
        </span>
      </div>
    </motion.div>
  );
};

export default ClassCard;