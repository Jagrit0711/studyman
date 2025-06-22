import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeProviderContextType = {
  theme: 'light'; // Always light
  setTheme: (theme: Theme) => void; // Kept for compatibility, but does nothing
  resolvedTheme: 'light';
};

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    localStorage.setItem('theme', 'light');
  }, []);

  const value = {
    theme: 'light' as const,
    setTheme: () => {
      // Dark mode is disabled. To enable, update this provider.
      console.log("Dark mode is coming soon!");
    },
    resolvedTheme: 'light' as const,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
};
