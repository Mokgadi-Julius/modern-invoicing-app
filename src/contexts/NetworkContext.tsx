import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { onNetworkStatusChange } from '../firebase/config';
import { featureFlags, log } from '../config';

interface NetworkState {
  isOnline: boolean;
  isConnecting: boolean;
  hasConnectivity: boolean;
  offlineMode: boolean;
}

interface NetworkContextType extends NetworkState {
  toggleOfflineMode: () => void;
  retry: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: navigator.onLine,
    isConnecting: false,
    hasConnectivity: navigator.onLine,
    offlineMode: false,
  });

  const [retryAttempts, setRetryAttempts] = useState(0);
  const maxRetryAttempts = 3;
  const isMountedRef = useRef(true);

  // Cleanup ref on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Handle network status changes
  useEffect(() => {
    const cleanup = onNetworkStatusChange((isOnline) => {
      if (!isMountedRef.current) return;
      
      log.info('Network status changed:', isOnline ? 'online' : 'offline');
      
      setNetworkState(prev => ({
        ...prev,
        isOnline,
        hasConnectivity: isOnline,
        isConnecting: false,
      }));

      // Reset retry attempts when back online
      if (isOnline) {
        setRetryAttempts(0);
      }
    });

    return cleanup;
  }, []);

  // Log network state changes for debugging
  useEffect(() => {
    log.debug('Network state updated:', networkState);
  }, [networkState]);

  const toggleOfflineMode = () => {
    if (!isMountedRef.current) return;
    
    setNetworkState(prev => ({
      ...prev,
      offlineMode: !prev.offlineMode,
    }));
  };

  const retry = async () => {
    if (retryAttempts >= maxRetryAttempts) {
      log.warn('Max retry attempts reached');
      return;
    }

    if (!isMountedRef.current) return;
    
    setNetworkState(prev => ({ ...prev, isConnecting: true }));
    setRetryAttempts(prev => prev + 1);

    try {
      // Attempt to check connectivity
      const response = await fetch('/favicon.ico', { 
        cache: 'no-cache',
        method: 'HEAD',
      });
      
      if (response.ok) {
        if (isMountedRef.current) {
          setNetworkState(prev => ({
            ...prev,
            isOnline: true,
            hasConnectivity: true,
            isConnecting: false,
          }));
          setRetryAttempts(0);
          log.info('Connection restored');
        }
      } else {
        throw new Error('Connectivity check failed');
      }
    } catch (error) {
      if (isMountedRef.current) {
        log.warn('Retry attempt failed:', error);
        setNetworkState(prev => ({ ...prev, isConnecting: false }));
      }
    }
  };

  const contextValue: NetworkContextType = {
    ...networkState,
    toggleOfflineMode,
    retry,
  };

  return (
    <NetworkContext.Provider value={contextValue}>
      {children}
      {!networkState.isOnline && <OfflineNotification />}
    </NetworkContext.Provider>
  );
}

// Offline notification component
const OfflineNotification: React.FC = () => {
  const { retry, isConnecting } = useNetwork();

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-600 text-white px-4 py-2 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-sm font-medium">
            {featureFlags.offlineSupport 
              ? 'You\'re offline. Some features may be limited.' 
              : 'No internet connection. Please check your network.'}
          </span>
        </div>
        
        <button
          onClick={retry}
          disabled={isConnecting}
          className="text-sm bg-orange-700 hover:bg-orange-800 px-3 py-1 rounded transition-colors disabled:opacity-50"
        >
          {isConnecting ? 'Checking...' : 'Retry'}
        </button>
      </div>
    </div>
  );
};

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}

export default NetworkProvider;