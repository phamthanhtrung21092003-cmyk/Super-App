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
  scaleFont: (size: number) => number;
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

  // Inject web fonts & font size scaling if necessary
  useEffect(() => {
    if (Platform.OS === 'web' && isReady) {
      let styleTag = document.getElementById('dynamic-theme-fonts');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'dynamic-theme-fonts';
        document.head.appendChild(styleTag);
      }
      
      const fontName = theme.fontFamily || 'Outfit';
      const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700;800&display=swap`;
      const scale = theme.fontSizeScale || 1.0;
      
      styleTag.textContent = `
        @import url('${fontUrl}');
        body, span, p, input, button { 
          font-family: '${fontName}', system-ui, -apple-system, sans-serif !important; 
        }
      `;
    }
  }, [theme.fontFamily, theme.fontSizeScale, isReady]);

  const updateTheme = async (newSettings: Partial<ThemeState>) => {
    const updatedTheme = { ...theme, ...newSettings };
    setTheme(updatedTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(updatedTheme));
    } catch (e) {
      console.error('Failed to save theme to storage', e);
    }
  };

  const scaleFont = (size: number): number => {
    return Math.round(size * (theme.fontSizeScale || 1.0));
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

  const textColorRgb = hexToRgb(theme.textColor || '#FFFFFF');

  return (
    <ThemeContext.Provider value={{ theme, textColorRgb, updateTheme, pickImage, scaleFont }}>
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
