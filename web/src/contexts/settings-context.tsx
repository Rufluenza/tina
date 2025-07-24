// src/contexts/SettingsContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUserSettings, updateUserSettings } from '@/app/actions'; // Assuming you have an update action
import { themes, Theme } from '@/lib/themes';
import type { UserSettings } from '@/lib/types'; // Make sure this path is correct

// Define the shape of the context data
interface SettingsContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

// Create the context with a default value
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Create the provider component
export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load settings from the database
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const userSettings = await getUserSettings();
      setSettings(userSettings);
    } catch (error) {
      console.error("Failed to load user settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load settings on initial mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Function to update settings in the database and locally
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!settings) return;
    
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings); // Optimistic update for instant UI feedback
    
    try {
      // id is given from userSettings
      // If you need to pass the ID, ensure it's included in the newSettings
      
      await updateUserSettings(updatedSettings); // Your server action to save to DB
    } catch (error) {
      console.error("Failed to update settings:", error);
      setSettings(settings); // Revert on failure
    }
  };

  // Apply theme and size multiplier to the root element
  useEffect(() => {
    if (settings) {
      const theme: Theme = themes[settings.theme] || themes.dark;
      const root = document.documentElement;
      
      Object.entries(theme).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      // Apply size multiplier
      const baseFontSize = 16; // Assumes your base font size is 16px
      root.style.fontSize = `${baseFontSize * (settings.sizeMultiplier || 1)}px`;
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
