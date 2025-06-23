// src/hooks/useSEO.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useSEO = ({
  title,
  description,
  keywords,
  image,
  type = 'website',
  structuredData
}) => {
  const location = useLocation();
  const baseUrl = 'https://unifitz.in';
  const fullUrl = `${baseUrl}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title ? `${title} | UNIFITZ` : 'UNIFITZ - Premium Online Fitness for Families';

    // Update meta tags
    updateMetaTag('description', description || 'Transform your fitness journey with UNIFITZ. Premium online fitness classes for the whole family - Zumba, Yoga, Weight Training. Join 21-minute daily sessions from home.');
    updateMetaTag('keywords', keywords || 'online fitness, family fitness, zumba classes, yoga online, weight training, home workout, fitness app, virtual fitness');

    // Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image || '/og-image.jpg');
    updateMetaTag('og:url', fullUrl);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'UNIFITZ');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image || '/twitter-image.jpg');

    // Canonical URL
    updateCanonical(fullUrl);

    // Structured Data
    if (structuredData) {
      updateStructuredData(structuredData);
    }

    // Add hreflang for internationalization
    updateHreflang('en', fullUrl);

  }, [title, description, keywords, image, type, fullUrl, structuredData]);
};

const updateMetaTag = (property, content) => {
  if (!content) return;
  
  let element = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
  
  if (element) {
    element.setAttribute('content', content);
  } else {
    element = document.createElement('meta');
    element.setAttribute(property.startsWith('og:') ? 'property' : 'name', property);
    element.setAttribute('content', content);
    document.getElementsByTagName('head')[0].appendChild(element);
  }
};

const updateCanonical = (url) => {
  let link = document.querySelector('link[rel="canonical"]');
  if (link) {
    link.setAttribute('href', url);
  } else {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    document.getElementsByTagName('head')[0].appendChild(link);
  }
};

const updateStructuredData = (data) => {
  let script = document.querySelector('#structured-data');
  if (script) {
    script.remove();
  }
  
  script = document.createElement('script');
  script.id = 'structured-data';
  script.type = 'application/ld+json';
  script.innerHTML = JSON.stringify(data);
  document.getElementsByTagName('head')[0].appendChild(script);
};

const updateHreflang = (lang, url) => {
  let link = document.querySelector(`link[hreflang="${lang}"]`);
  if (link) {
    link.setAttribute('href', url);
  } else {
    link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang);
    link.setAttribute('href', url);
    document.getElementsByTagName('head')[0].appendChild(link);
  }
};