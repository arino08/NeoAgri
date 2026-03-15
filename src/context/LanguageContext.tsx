import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
  t: (key: TranslationKey | string) => string;
  isReady: boolean;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<string>('en');
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        const validLanguages = Object.keys(translations);
        if (savedLanguage && validLanguages.includes(savedLanguage)) {
          setLanguage(savedLanguage);
        }
      } catch (e) {
        console.error('Failed to load language', e);
      } finally {
        setIsReady(true);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (newLang: string): Promise<void> => {
    try {
      await AsyncStorage.setItem('userLanguage', newLang);
      setLanguage(newLang);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  const t = (key: TranslationKey | string): string => {
    const currentTranslations = translations[language] || translations.en;
    return currentTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
};
