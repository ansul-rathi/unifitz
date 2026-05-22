import { FC } from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/21-days/Hero';
import Sessions from '../components/21-days/Sessions';

const Day21Challenge: FC = () => {
  return (
    <>
      <Helmet>
        <title>21-Day Fitness Challenge for Women | Free Trial | Unifitz</title>
        <meta name="description" content="Complete a 21-day fitness transformation with daily Zumba, Yoga & Strength workouts. Designed for Indian women aged 30–50. Join 5,000+ members. Start your free trial today." />
        <link rel="canonical" href="https://unifitz.in/21-days" />
        <meta name="keywords" content="21 day fitness challenge india, 21 day workout challenge women, zumba challenge india, yoga challenge women india, unifitz 21 day challenge" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://unifitz.in/21-days" />
        <meta property="og:site_name" content="Unifitz" />
        <meta property="og:title" content="21-Day Fitness Challenge for Women | Unifitz" />
        <meta property="og:description" content="Transform in 21 days with daily Zumba, Yoga & Strength sessions. For Indian women aged 30–50. Free to start." />
        <meta property="og:image" content="https://unifitz.in/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Unifitz 21-Day Fitness Challenge for Women" />
        <meta property="og:locale" content="en_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@unifitz" />
        <meta name="twitter:title" content="21-Day Fitness Challenge for Women | Unifitz" />
        <meta name="twitter:description" content="Transform in 21 days with daily Zumba, Yoga & Strength. Indian women 30–50. Free to join." />
        <meta name="twitter:image" content="https://unifitz.in/og-image.jpg" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                "@id": "https://unifitz.in/21-days#webpage",
                "url": "https://unifitz.in/21-days",
                "name": "21-Day Fitness Challenge for Women | Unifitz",
                "description": "Complete a 21-day fitness transformation with daily Zumba, Yoga & Strength workouts for Indian women aged 30–50.",
                "isPartOf": { "@id": "https://unifitz.in/#website" },
                "inLanguage": "en-IN",
                "breadcrumb": {
                  "@type": "BreadcrumbList",
                  "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://unifitz.in/" },
                    { "@type": "ListItem", "position": 2, "name": "21-Day Challenge", "item": "https://unifitz.in/21-days" }
                  ]
                }
              },
              {
                "@type": "Course",
                "@id": "https://unifitz.in/21-days#course",
                "name": "Unifitz 21-Day Fitness Challenge",
                "description": "A structured 21-day fitness program with daily Zumba, Yoga, and Strength workouts designed for Indian women aged 30–50.",
                "url": "https://unifitz.in/21-days",
                "provider": { "@id": "https://unifitz.in/#organization" },
                "inLanguage": ["en-IN", "hi"],
                "audience": {
                  "@type": "PeopleAudience",
                  "suggestedGender": "Female",
                  "suggestedMinAge": 30,
                  "suggestedMaxAge": 50
                },
                "hasCourseInstance": {
                  "@type": "CourseInstance",
                  "courseMode": "Online",
                  "courseSchedule": {
                    "@type": "Schedule",
                    "duration": "P21D",
                    "repeatFrequency": "P1D"
                  },
                  "instructor": [
                    { "@type": "Person", "name": "Ansul Rathi", "jobTitle": "Founder & Head Coach" }
                  ]
                },
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR",
                  "availability": "https://schema.org/InStock",
                  "description": "3-day free trial — no credit card required"
                }
              }
            ]
          }
        `}</script>
      </Helmet>
      <div className="min-h-screen bg-white">
        <Hero />
        <Sessions />
      </div>
    </>
  );
}

export default Day21Challenge;
