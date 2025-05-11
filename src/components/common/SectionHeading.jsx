/* eslint-disable react/prop-types */
import { motion } from 'framer-motion';
import GradientBadge from './GradientBadge';

/**
 * A component for consistent section headings across the site
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Main heading text
 * @param {string} props.highlight - Text to be highlighted within the title
 * @param {string} props.subtitle - Subheading text
 * @param {string} props.badge - Optional badge text
 * @param {string} props.badgeVariant - Gradient variant for the badge
 * @param {boolean} props.centered - Whether the heading should be centered
 * @param {string} props.className - Additional CSS classes
 */
const SectionHeading = ({
  title,
  highlight,
  subtitle,
  badge,
  badgeVariant = 'pink',
  centered = true,
  className = '',
  ...rest
}) => {
  // Split the title to insert the highlighted text
  let titleStart = title;
  let titleEnd = '';
  
  if (highlight) {
    const parts = title.split(highlight);
    if (parts.length > 1) {
      titleStart = parts[0];
      titleEnd = parts[1];
    }
  }

  return (
    <div className={`${centered ? 'text-center' : ''} mb-16 ${className}`} {...rest}>
      {badge && (
        <GradientBadge variant={badgeVariant} animate>
          {badge}
        </GradientBadge>
      )}
      
      <motion.h2 
        className="text-4xl md:text-5xl font-bold mb-4 text-white"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {titleStart}
        {highlight && <span className="text-pink-400"> {highlight}</span>}
        {titleEnd}
      </motion.h2>
      
      {subtitle && (
        <motion.p 
          className="text-xl text-white/80 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeading;