// src/utils/structuredData.js
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "UNIFITZ",
  "description": "Premium online fitness platform for families",
  "url": "https://unifitz.in",
  "logo": "https://unifitz.in/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-7387846841",
    "contactType": "customer service",
    "availableLanguage": ["English", "Hindi"]
  },
  "sameAs": [
    "https://instagram.com/unifitz.in",
    "https://facebook.com/unifitz",
    "https://youtube.com/unifitz"
  ]
});

export const generateWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "UNIFITZ",
  "url": "https://unifitz.in",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://unifitz.in/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});

export const generateServiceSchema = (service) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.name,
  "description": service.description,
  "provider": {
    "@type": "Organization",
    "name": "UNIFITZ"
  },
  "serviceType": "Fitness Training",
  "areaServed": "India",
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "https://unifitz.in",
    "serviceSmsNumber": "+91-7387846841"
  }
});