// src/App.js
import React from 'react';
import Navbar from './components/Navigation/Navbar';
import Hero from './components/Hero/Hero';
import Programs from './components/Programs/Programs';
import TeamSection from './components/Team/Team';
import BMICalculator from './components/BMI/BMICalculator';
import Footer from './components/Footer/Footer';
import ContactUs from './components/ContactUs/Contactus';
import Timetable from './components/TimeTable/Timetable';

const App = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <Hero />
      <Programs />
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Calculate Your BMI</h2>
          <BMICalculator />
        </div>
      </section>
      <Timetable />
      <TeamSection />
      <ContactUs />
      <Footer />
    </div>
  );
};

export default App;