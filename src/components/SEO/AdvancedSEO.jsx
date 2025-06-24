/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/SEO/AdvancedSEO.jsx
import { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const AdvancedSEO = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  videoUrl,
  videoDuration,
  videoThumbnail,
  breadcrumbs = [],
  faqData = [],
  reviewData = null,
  productData = null,
  organizationData = null,
  localBusinessData = null
}) => {
  const location = useLocation();
  const baseUrl = 'https://unifitz.in';
  const currentUrl = `${baseUrl}${location.pathname}`;
  
  // Dynamic title generation
  const pageTitle = useMemo(() => {
    if (title) {
      return title.length > 60 ? title.substring(0, 57) + '...' : title;
    }
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) return 'UNIFITZ - Premium Online Family Fitness Platform';
    
    const pathTitles = {
      'challenges': 'Fitness Challenges',
      'zumba': 'Zumba Dance Fitness',
      'yoga': 'Yoga Classes',
      'weight-training': 'Weight Training',
      'about': 'About Us',
      'contact': 'Contact',
      'recipes': 'Healthy Recipes',
      'tools': 'Fitness Tools & Calculators'
    };
    
    return `${pathTitles[pathSegments[0]] || pathSegments[0]} | UNIFITZ`;
  }, [title, location.pathname]);

  // Dynamic description generation
  const metaDescription = useMemo(() => {
    if (description) return description;
    
    const pathDescriptions = {
      '/': 'Transform your family fitness journey with UNIFITZ. Premium online fitness classes, AI coaching, and 21-minute daily workouts for all ages.',
      '/challenges': 'Join our 21-day fitness challenges designed for families. Expert guidance, progressive training, and proven results.',
      '/zumba': 'High-energy Zumba dance fitness classes for the whole family. Burn calories while having fun with our certified instructors.',
      '/yoga': 'Discover inner peace and flexibility with our family-friendly yoga sessions. Suitable for all levels and ages.',
      '/weight-training': 'Build strength and muscle with our bodyweight and equipment-based training programs.',
      '/about': 'Learn about UNIFITZ mission to revolutionize family fitness through technology and expert coaching.',
      '/contact': 'Get in touch with our fitness experts. Join thousands of families already transforming their health.',
      '/tools': 'Access 20+ fitness calculators and tools. BMI, calorie tracking, workout planning, and more.'
    };
    
    return pathDescriptions[location.pathname] || 'Discover premium family fitness solutions with UNIFITZ.';
  }, [description, location.pathname]);

  // Enhanced keywords generation
  const metaKeywords = useMemo(() => {
    const baseKeywords = [
      'online fitness',
      'family fitness',
      'home workouts',
      'fitness platform',
      'virtual training',
      'UNIFITZ'
    ];
    
    const pathKeywords = {
      '/challenges': ['fitness challenges', '21-day program', 'workout challenges'],
      '/zumba': ['zumba classes', 'dance fitness', 'cardio dance', 'latin dance'],
      '/yoga': ['yoga classes', 'mindfulness', 'meditation', 'flexibility'],
      '/weight-training': ['strength training', 'muscle building', 'bodyweight exercises'],
      '/tools': ['fitness calculator', 'BMI calculator', 'calorie calculator']
    };
    
    const pageKeywords = pathKeywords[location.pathname] || [];
    return [...baseKeywords, ...pageKeywords, ...(keywords || [])].join(', ');
  }, [keywords, location.pathname]);

  // Structured Data Schemas
  const generateOrganizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "UNIFITZ",
    "description": "Premium online fitness platform for families",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "foundingDate": "2024",
    "founders": [
      {
        "@type": "Person",
        "name": "Ansul Rathi"
      }
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-7387846841",
      "contactType": "customer service",
      "email": "theunifitz@gmail.com",
      "availableLanguage": ["English", "Hindi"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://instagram.com/unifitz.in",
      "https://facebook.com/unifitz",
      "https://youtube.com/unifitz"
    ],
    "offers": {
      "@type": "Offer",
      "category": "Fitness Services",
      "availability": "https://schema.org/InStock"
    }
  });

  const generateWebSiteSchema = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "UNIFITZ",
    "url": baseUrl,
    "description": "Premium online fitness platform for families",
    "publisher": {
      "@type": "Organization",
      "name": "UNIFITZ"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  });

  const generateBreadcrumbSchema = () => {
    if (breadcrumbs.length === 0) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": `${baseUrl}${crumb.url}`
      }))
    };
  };

  const generateVideoSchema = () => {
    if (!videoUrl) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": pageTitle,
      "description": metaDescription,
      "thumbnailUrl": videoThumbnail || image,
      "uploadDate": publishedTime,
      "duration": videoDuration,
      "contentUrl": videoUrl,
      "embedUrl": videoUrl,
      "publisher": {
        "@type": "Organization",
        "name": "UNIFITZ"
      }
    };
  };

  const generateFAQSchema = () => {
    if (faqData.length === 0) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqData.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  };

  const generateProductSchema = () => {
    if (!productData) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": productData.name,
      "description": productData.description,
      "image": productData.image,
      "brand": {
        "@type": "Brand",
        "name": "UNIFITZ"
      },
      "offers": {
        "@type": "Offer",
        "price": productData.price,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString()
      },
      "aggregateRating": productData.rating ? {
        "@type": "AggregateRating",
        "ratingValue": productData.rating.value,
        "reviewCount": productData.rating.count
      } : undefined
    };
  };

  const generateLocalBusinessSchema = () => {
    if (!localBusinessData) return null;
    
    return {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "UNIFITZ",
      "image": `${baseUrl}/logo.png`,
      "telephone": "+91-7387846841",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      },
      "geo": localBusinessData.coordinates ? {
        "@type": "GeoCoordinates",
        "latitude": localBusinessData.coordinates.lat,
        "longitude": localBusinessData.coordinates.lng
      } : undefined,
      "url": baseUrl,
      "priceRange": "₹₹",
      "openingHours": "Mo-Su 06:00-22:00"
    };
  };

  // Combined structured data
  const structuredData = useMemo(() => {
    const schemas = [
      generateOrganizationSchema(),
      generateWebSiteSchema(),
      generateBreadcrumbSchema(),
      generateVideoSchema(),
      generateFAQSchema(),
      generateProductSchema(),
      generateLocalBusinessSchema()
    ].filter(Boolean);
    
    return schemas;
  }, [location.pathname, breadcrumbs, faqData, videoUrl, productData, localBusinessData]);

  // Dynamic image optimization
  const optimizedImage = useMemo(() => {
    if (image) return image;
    
    const defaultImages = {
      '/': `${baseUrl}/og-home.jpg`,
      '/challenges': `${baseUrl}/og-challenges.jpg`,
      '/zumba': `${baseUrl}/og-zumba.jpg`,
      '/yoga': `${baseUrl}/og-yoga.jpg`,
      '/weight-training': `${baseUrl}/og-weight-training.jpg`,
      '/tools': `${baseUrl}/og-tools.jpg`
    };
    
    return defaultImages[location.pathname] || `${baseUrl}/og-default.jpg`;
  }, [image, location.pathname]);

  // Performance optimization hints
  useEffect(() => {
    // Preload critical resources
    const criticalResources = [
      '/fonts/inter-var.woff2',
      '/images/hero-bg.webp'
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.includes('.woff2') ? 'font' : 'image';
      if (resource.includes('.woff2')) {
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });

    // Prefetch next likely pages
    const prefetchPages = ['/challenges', '/about', '/contact'];
    prefetchPages.forEach(page => {
      if (location.pathname !== page) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = page;
        document.head.appendChild(link);
      }
    });

    return () => {
      // Cleanup if needed
    };
  }, [location.pathname]);

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Language and Region */}
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={optimizedImage} />
      <meta property="og:image:alt" content={`${pageTitle} - UNIFITZ`} />
      <meta property="og:site_name" content="UNIFITZ" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={metaDescription} />
      <meta property="twitter:image" content={optimizedImage} />
      <meta property="twitter:creator" content="@unifitz" />
      
      {/* Article specific (if applicable) */}
      {author && <meta property="article:author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Video specific (if applicable) */}
      {videoUrl && (
        <>
          <meta property="og:video" content={videoUrl} />
          <meta property="og:video:type" content="text/html" />
          <meta property="og:video:width" content="1920" />
          <meta property="og:video:height" content="1080" />
        </>
      )}
      
      {/* Performance & Security */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link rel="preconnect" href="https://www.youtube-nocookie.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.youtube-nocookie.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      
      {/* Favicons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
      
      {/* Additional Performance Hints */}
      <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="modulepreload" href="/src/main.jsx" />
      
      {/* CSP and Security Headers (if supported by hosting) */}
      <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
      
      {/* PWA specific */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="UNIFITZ" />
      
      {/* Rich Snippets Support */}
      <meta name="application-name" content="UNIFITZ" />
      <meta name="msapplication-tooltip" content="Premium Family Fitness Platform" />
      <meta name="msapplication-starturl" content="/" />
      
      {/* Hreflang for internationalization (if applicable) */}
      <link rel="alternate" hrefLang="en-in" href={currentUrl} />
      <link rel="alternate" hrefLang="x-default" href={currentUrl} />
      
      {/* Copyright and Author */}
      <meta name="copyright" content="© 2025 UNIFITZ. All rights reserved." />
      <meta name="author" content="UNIFITZ Team" />
      <meta name="designer" content="UNIFITZ Design Team" />
      <meta name="owner" content="UNIFITZ" />
      
      {/* Cache Control */}
      <meta httpEquiv="Cache-Control" content="public, max-age=31536000" />
    </Helmet>
  );
};

export default AdvancedSEO;