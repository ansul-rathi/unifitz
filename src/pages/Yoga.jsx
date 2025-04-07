/* eslint-disable import/no-unresolved */
// Layout components

// Zumba page section components
import Hero from '../components/Yoga/Hero';
import Benefits from '../components/Yoga/BenefitCard';
import Classes from '../components/Yoga/Classes';
import PricingSection from '../components/Yoga/PricingSection';
import Testimonials from '../components/Yoga/Testimonials';
import Cta from '../components/Yoga/Cta';

// Import animations for the page
import '../styles/animations.css';

const YogaPage = () => {
  return (
      <main>
        <Hero />
        <Benefits />
        <Classes />
        <PricingSection />
        <Testimonials />
        <Cta />
      </main>
  );
};

export default YogaPage;