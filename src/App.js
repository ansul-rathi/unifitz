/* eslint-disable no-unused-vars */
// src/App.js
import Navbar from './components/Navigation/Navbar';
import Hero from './components/Hero/Hero';
import Programs from './components/Programs/Programs';
import TeamSection from './components/Team/Team';
import BMICalculator from './components/BMI/BMICalculator';
import Footer from './components/Footer/Footer';
import ContactUs from './components/ContactUs/Contactus';
// import Timetable from './components/TimeTable/Timetable';
import ErrorBoundary from './components/ErrorBoundary';
// import Testimonials from './components/Testimonials/Testimonials';
import EnergyMeter from './components/EnergyMeter/EnergyMeter';
import CountdownTimer from './components/CountdownTimer/CountdownTimer';

const App = () => {
  return (
    // <ErrorBoundary>
    //   <div className="min-h-screen bg-black text-white">
    //     <ErrorBoundary>
    //       <Navbar />
    //     </ErrorBoundary>
    //     <ErrorBoundary>
    //       <Hero />
    //     </ErrorBoundary>
    //     <ErrorBoundary>
    //     {/* <Testimonials /> */}
    //     {/* <EnergyMeter /> */}
    //     </ErrorBoundary>
    //     <ErrorBoundary>
    //       <Programs />
    //     </ErrorBoundary>
    //     <ErrorBoundary>
    //           <BMICalculator />
    //     </ErrorBoundary>
    //     {/* <ErrorBoundary>
    //       <Timetable />
    //     </ErrorBoundary> */}
    //     <ErrorBoundary>
    //       <TeamSection />
    //     </ErrorBoundary>
    //     <ErrorBoundary>
    //       <ContactUs />
    //     </ErrorBoundary>
    //     <ErrorBoundary>
    //       <Footer />
    //     </ErrorBoundary>
    //   </div>
    // </ErrorBoundary>
    <ErrorBoundary>
      <CountdownTimer />
    </ErrorBoundary>
  );
};

export default App;