/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import Hero from '../components/21-days/Hero';
import Benefits from '../components/21-days/Benefits';
import Trainers from '../components/21-days/Trainers';
import Pricing from '../components/21-days/Pricing';
import Testimonials from '../components/21-days/Testimonials';
import FAQ from '../components/21-days/Faqs';
import Footer from '../components/21-days/Footer';
import ExitPopup from '../components/21-days/ExitPopup';

function App() {
  const [showExitPopup, setShowExitPopup] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) {
        setShowExitPopup(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Benefits />
      <Trainers />
      <Testimonials />
      {/* <Pricing /> */}
      <FAQ />
      <Footer />
      {showExitPopup && <ExitPopup onClose={() => setShowExitPopup(false)} />}
    </div>
  );
}

export default App;
