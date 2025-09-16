// Version utilities for cache busting and update notifications
export const APP_VERSION = __APP_VERSION__ || '2.1.0';
export const BUILD_TIMESTAMP = __BUILD_TIMESTAMP__ || new Date().toISOString();

// Register service worker for cache busting
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered with scope:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              console.log('New content is available; please refresh.');
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Check if there's a newer version available
export const checkForUpdates = async (): Promise<boolean> => {
  try {
    // Get the current cached version
    const cachedVersion = localStorage.getItem('app-version');
    const cachedBuildTime = localStorage.getItem('build-timestamp');
    
    // If this is a new version, clear cache and update stored version
    if (cachedVersion !== APP_VERSION || cachedBuildTime !== BUILD_TIMESTAMP) {
      // Clear various caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Update service worker if available
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      }
      
      // Update stored version info
      localStorage.setItem('app-version', APP_VERSION);
      localStorage.setItem('build-timestamp', BUILD_TIMESTAMP);
      
      return true; // New version detected
    }
    
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
      }
    }
    
    return false; // Same version
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
};

// Force reload the page to get latest version
export const forceReload = () => {
  // Clear all possible caches
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
        // Force update service worker
        registration.update();
      });
    });
  }
  
  // Clear browser cache
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // Hard reload with cache bypass
  window.location.reload();
};

// Get version info for display
export const getVersionInfo = () => ({
  version: APP_VERSION,
  buildTime: BUILD_TIMESTAMP,
  buildDate: new Date(BUILD_TIMESTAMP).toLocaleDateString(),
});

// Check if app is running latest version
export const isLatestVersion = (): boolean => {
  const cachedVersion = localStorage.getItem('app-version');
  const cachedBuildTime = localStorage.getItem('build-timestamp');
  return cachedVersion === APP_VERSION && cachedBuildTime === BUILD_TIMESTAMP;
};