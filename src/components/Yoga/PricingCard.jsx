/* eslint-disable react/prop-types */
import Button from '../common/Button';
import GradientCard from '../common/GradientCard';

/**
 * Component for displaying a pricing plan card for yoga classes
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Plan title
 * @param {string} props.price - Plan price
 * @param {string} props.period - Billing period (e.g., /month)
 * @param {string} props.subtitle - Short description below price
 * @param {Array} props.features - List of features for this plan
 * @param {string} props.variant - Color variant for the card
 * @param {boolean} props.featured - Whether this is the featured plan
 * @param {boolean} props.featuredLabel - Text for the featured label
 */
const PricingCard = ({
  title,
  price,
  period,
  subtitle,
  features = [],
  variant = 'blue',
  featured = false,
  featuredLabel = 'MOST POPULAR',
  ...rest
}) => {
  // Feature check icon color based on variant
  const checkIconColors = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    indigo: 'text-indigo-500',
    teal: 'text-teal-500'
  };

  // Button variants based on card variant
  const buttonVariants = {
    blue: 'secondary',
    purple: 'secondary',
    indigo: 'secondary',
    teal: 'white'
  };

  // Text gradient for the price
  const priceGradients = {
    blue: 'from-blue-400 to-teal-400',
    purple: 'from-purple-400 to-indigo-400',
    indigo: 'from-indigo-400 to-blue-400',
    teal: 'from-teal-400 to-blue-400'
  };

  return (
    <GradientCard 
      variant={variant} 
      featured={featured}
      {...rest}
    >
      {featured && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
          {featuredLabel}
        </div>
      )}
      
      <div className={`text-center mb-8 ${featured ? 'pt-4' : ''}`}>
        <h3 className="text-2xl font-bold mb-2 text-white">{title}</h3>
        <div className="flex items-center justify-center mb-2">
          <span className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${priceGradients[variant]}`}>
            {price}
          </span>
          <span className="text-gray-400 ml-2">{period}</span>
        </div>
        {subtitle && <p className="text-sm text-white/60">{subtitle}</p>}
      </div>
      
      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-white">
            <svg 
              className={`h-5 w-5 ${checkIconColors[variant]} mr-3`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span className={featured ? "font-medium" : ""}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      
      <Button 
        variant={buttonVariants[variant]} 
        size="lg" 
        fullWidth
        href="/yoga/join"
      >
        Get Started
      </Button>
    </GradientCard>
  );
};

export default PricingCard;