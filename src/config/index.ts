// Environment configuration
export const config = {
  // Firebase configuration
  firebase: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  },

  // App configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'InvoiceWriteNow',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  },

  // Admin configuration
  admin: {
    setupKey: import.meta.env.VITE_ADMIN_SETUP_KEY,
  },

  // Feature flags
  features: {
    offlineSupport: import.meta.env.VITE_ENABLE_OFFLINE_SUPPORT === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    errorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
  },

  // Development settings
  dev: {
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },

  // External services
  services: {
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    analyticsId: import.meta.env.VITE_ANALYTICS_ID,
  },
} as const;

// Environment helpers
export const isDevelopment = () => config.app.environment === 'development';
export const isProduction = () => config.app.environment === 'production';
export const isDebugMode = () => config.dev.debugMode;

// Firebase config validation
export const validateFirebaseConfig = () => {
  const required = [
    'apiKey',
    'authDomain', 
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId'
  ];
  
  const missing = required.filter(key => !config.firebase[key as keyof typeof config.firebase]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Firebase configuration: ${missing.join(', ')}`);
  }
  
  return true;
};

// Console logging utility that respects environment
export const log = {
  debug: (...args: any[]) => {
    if (config.dev.debugMode || config.dev.logLevel === 'debug') {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: any[]) => {
    if (['debug', 'info'].includes(config.dev.logLevel)) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: any[]) => {
    if (['debug', 'info', 'warn'].includes(config.dev.logLevel)) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};

// Export individual configs for convenience
export const firebaseConfig = config.firebase;
export const appConfig = config.app;
export const adminConfig = config.admin;
export const featureFlags = config.features;

export default config;