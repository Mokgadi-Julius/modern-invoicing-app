import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { firebaseConfig, validateFirebaseConfig, log, isDevelopment } from '../config';

// Validate Firebase configuration before initializing
try {
  validateFirebaseConfig();
  log.info('Firebase configuration validated successfully');
} catch (error) {
  log.error('Firebase configuration validation failed:', error);
  throw error;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Functions and get a reference to the service
export const functions = getFunctions(app);

// Log successful initialization
log.info('Firebase services initialized successfully');

// Network status utilities
export const getNetworkStatus = () => {
  return navigator.onLine;
};

export const onNetworkStatusChange = (callback: (isOnline: boolean) => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

export default app;