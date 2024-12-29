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
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white">
        <ErrorBoundary>
          <Navbar />
        </ErrorBoundary>
        <ErrorBoundary>
          <Hero />
        </ErrorBoundary>
        <ErrorBoundary>
          <Programs />
        </ErrorBoundary>
        <ErrorBoundary>
          <section className="py-20 bg-gray-900">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold mb-12 text-center">Calculate Your BMI</h2>
              <BMICalculator />
            </div>
          </section>
        </ErrorBoundary>
        <ErrorBoundary>
          <Timetable />
        </ErrorBoundary>
        <ErrorBoundary>
          <TeamSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <ContactUs />
        </ErrorBoundary>
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default App;