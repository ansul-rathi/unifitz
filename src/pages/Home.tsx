import { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import NavBar from '../components/landing/NavBar';
import WorkoutsSection from '../components/landing/WorkoutsSection';
import TransformationsSection from '../components/landing/TransformationsSection';
import BatchTimingsSection from '../components/landing/BatchTimingsSection';
import ProgramsSection from '../components/landing/ProgramsSection';
import WhyUnifitzSection from '../components/landing/WhyUnifitzSection';
import CoachesSection from '../components/landing/CoachesSection';
import CommunitySection from '../components/landing/CommunitySection';
import FAQSection from '../components/landing/FAQSection';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';
import WhatsAppButton from '../components/landing/WhatsAppButton';

const Home: FC = () => (
  <>
    <Helmet>
      <title>Unifitz | Live Zumba, Yoga & Fitness Classes for Women in India</title>
      <meta name="description" content="Join 5,000+ Indian women transforming with live Zumba, Yoga & Strength classes from home. Mon–Sat morning & evening batches. 3-day free trial — no credit card needed." />
      <link rel="canonical" href="https://unifitz.in/" />
    </Helmet>

    <div className="bg-background text-on-background min-h-screen">
      <NavBar />
      <main>
        <WorkoutsSection />
        <section aria-label="Transformation stories">
          <TransformationsSection />
        </section>
        <section aria-label="Live batch timings">
          <BatchTimingsSection />
        </section>
        <section aria-label="Fitness programs">
          <ProgramsSection />
        </section>
        <section aria-label="Why choose Unifitz">
          <WhyUnifitzSection />
        </section>
        <section id="coaches" aria-label="Meet your coaches">
          <CoachesSection />
        </section>
        <section id="community" aria-label="Join our community">
          <CommunitySection />
        </section>
        <section aria-label="Frequently asked questions">
          <FAQSection />
        </section>
        <section aria-label="Start your free trial">
          <FinalCTA />
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  </>
);

export default Home;
