import React, { createContext, useContext, useEffect } from 'react';
import { useApp } from './AppContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useApp();
  const theme = settings.theme;

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    await updateSettings({ theme: newTheme });
  };

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);

    // Also apply to body class for additional styling options
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme-aware component helper
export function getThemeClasses(theme: Theme) {
  if (theme === 'light') {
    return {
      background: 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50',
      card: 'bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-xl',
      text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        muted: 'text-gray-500'
      },
      input: 'bg-white/80 border border-gray-200/50 text-gray-900 placeholder-gray-500 focus:border-blue-500',
      button: {
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white',
        secondary: 'bg-white/90 hover:bg-white text-gray-900 border border-gray-300/50'
      }
    };
  } else {
    return {
      background: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900',
      card: 'bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 shadow-xl',
      text: {
        primary: 'text-white',
        secondary: 'text-slate-300',
        muted: 'text-slate-400'
      },
      input: 'bg-slate-700/80 border border-slate-600/50 text-white placeholder-slate-400 focus:border-blue-500',
      button: {
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white',
        secondary: 'bg-slate-700/90 hover:bg-slate-600 text-white border border-slate-600/50'
      }
    };
  }
}