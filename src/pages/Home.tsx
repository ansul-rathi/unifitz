import { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import StickyCtaBar from '../components/landing/StickyCtaBar';
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


const Home: FC = () => (
  <>
    <Helmet>
      <title>Unifitz | Live Online Zumba, Yoga & Fitness Classes for Women in India</title>
      <meta name="description" content="Join 5,000+ Indian women transforming with live Zumba, Yoga & Strength classes from home. Mon–Sat morning & evening batches. 3-day free trial — no credit card needed." />
      <link rel="canonical" href="https://unifitz.in/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://unifitz.in/" />
      <meta property="og:site_name" content="Unifitz" />
      <meta property="og:title" content="Unifitz | Live Online Zumba, Yoga & Fitness Classes for Women in India" />
      <meta property="og:description" content="Join 5,000+ Indian women transforming with live Zumba, Yoga & Strength classes from home. 3-day free trial — no credit card needed." />
      <meta property="og:image" content="https://unifitz.in/og-image.jpg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Unifitz — Live Zumba, Yoga & Fitness Classes for Women" />
      <meta property="og:locale" content="en_IN" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@unifitz" />
      <meta name="twitter:title" content="Unifitz | Live Online Zumba, Yoga & Fitness for Women" />
      <meta name="twitter:description" content="5,000+ Indian women transforming with live Zumba, Yoga & Strength. 3-day free trial." />
      <meta name="twitter:image" content="https://unifitz.in/og-image.jpg" />
      <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://unifitz.in/#webpage",
          "url": "https://unifitz.in/",
          "name": "Unifitz | Live Online Zumba, Yoga & Fitness Classes for Women in India",
          "description": "Join 5,000+ Indian women transforming with live Zumba, Yoga & Strength classes from home. 3-day free trial — no credit card needed.",
          "isPartOf": { "@id": "https://unifitz.in/#website" },
          "about": { "@id": "https://unifitz.in/#business" },
          "inLanguage": "en-IN",
          "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://unifitz.in/" }
            ]
          }
        }
      `}</script>
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
      <StickyCtaBar />
    </div>
  </>
);

export default Home;
