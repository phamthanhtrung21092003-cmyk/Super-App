import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const THEME_STORAGE_KEY = '@app_theme_settings';

export interface ThemeState {
  fontFamily: string;
  fontSizeScale: number;
  textColor: string;
  backgroundImage: string | null;
  background?: string;
}

const DEFAULT_THEME: ThemeState = {
  fontFamily: 'Outfit',
  fontSizeScale: 1.0,
  textColor: '#FFFFFF',
  backgroundImage: null, // null means use default array
  background: '#F8FAFC', // Default bright background for travel/explore content screens
};

interface ThemeContextProps {
  theme: ThemeState;
  textColorRgb: string;
  updateTheme: (newTheme: Partial<ThemeState>) => Promise<void>;
  pickImage: () => Promise<void>;
}

export const hexToRgb = (hex: string): string => {
  const h = hex.replace('#', '');
  if (h.length === 6) {
    return `${parseInt(h.substring(0,2), 16)}, ${parseInt(h.substring(2,4), 16)}, ${parseInt(h.substring(4,6), 16)}`;
  }
  return '255, 255, 255';
};

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeState>(DEFAULT_THEME);
  const [isReady, setIsReady] = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme) {
          setTheme({ ...DEFAULT_THEME, ...JSON.parse(storedTheme) });
        }
      } catch (e) {
        console.error('Failed to load theme from storage', e);
      } finally {
        setIsReady(true);
      }
    };
    loadTheme();
  }, []);

  // Inject web fonts if necessary
  useEffect(() => {
    if (Platform.OS === 'web' && isReady) {
      // Create or update style tag for fonts
      let styleTag = document.getElementById('dynamic-theme-fonts');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-theme-fonts';
        document.head.appendChild(styleTag);
      }
      
      // Load Google Fonts based on selected fontFamily
      const fontUrl = `https://fonts.googleapis.com/css2?family=${theme.fontFamily.replace(' ', '+')}:wght@300;400;500;600;700;800&display=swap`;
      
      styleTag.textContent = `
        @import url('${fontUrl}');
        body, div[dir="auto"], span, p { 
          font-family: '${theme.fontFamily}', system-ui, -apple-system, sans-serif; 
        }
      `;
    }
  }, [theme.fontFamily, isReady]);

  const updateTheme = async (newSettings: Partial<ThemeState>) => {
    const updatedTheme = { ...theme, ...newSettings };
    setTheme(updatedTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updatedTheme));
    } catch (e) {
      console.error('Failed to save theme to storage', e);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      if (Platform.OS === 'web') {
        window.alert('Cần cấp quyền truy cập ảnh để thay đổi hình nền!');
      } else {
        alert('Cần cấp quyền truy cập ảnh để thay đổi hình nền!');
      }
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await updateTheme({ backgroundImage: result.assets[0].uri });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, pickImage }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
