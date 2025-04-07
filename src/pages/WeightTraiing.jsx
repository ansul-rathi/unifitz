import Hero from '../components/weight-training/Hero';
import Benefits from '../components/weight-training/BenefitCard';
import Classes from '../components/weight-training/Classes';
import PricingSection from '../components/weight-training/PricingSection';
import Testimonials from '../components/weight-training/Testimonials';
import Cta from '../components/weight-training/Cta';

// Import animations
import '../styles/animations.css';

const WeightTrainingPage = () => {
  return (
    // <PageContainer bgColor="bg-gradient-to-b from-slate-900 via-emerald-900 to-slate-900">
    //   <Header />
      
      <main>
        <Hero />
        <Benefits />
        <Classes />
        <PricingSection />
        <Testimonials />
        <Cta />
      </main>
      
    //   <Footer />
    // </PageContainer>
  );
};

export default WeightTrainingPage;