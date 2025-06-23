// src/utils/performance.js
export const prefetchRoutes = () => {
  const routes = ['/challenges', '/about', '/contact', '/zumba', '/yoga', '/weight-training'];
  
  routes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
};

export const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
};

export const optimizeImages = (src, width = 800, quality = 80) => {
  // Use services like Cloudinary, ImageKit, or implement your own image optimization
  return `${src}?w=${width}&q=${quality}&f=auto`;
};

// Register service worker
export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New update available
                const event = new CustomEvent('swUpdate');
                window.dispatchEvent(event);
              }
            }
          });
        });
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  }
};