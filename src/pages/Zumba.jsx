/* eslint-disable import/no-unresolved */
// Layout components

// Zumba page section components
import Hero from '../components/zumba/Hero';
import Benefits from '../components/zumba/Benefits';
import Classes from '../components/zumba/Classes';
import PricingSection from '../components/zumba/PricingSection';
import Testimonials from '../components/zumba/Testimonials';
import Cta from '../components/zumba/Cta';

// Import animations for the page
import '../styles/animations.css';

const ZumbaPage = () => {
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

export default ZumbaPage;