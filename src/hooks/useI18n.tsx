'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ru from '@/locales/ru.json';
import en from '@/locales/en.json';

const translations = { ru, en };
export type Language = keyof typeof translations;

type I18nContextType = { language: Language; setLanguage: (lang: string) => void; t: (key: string, params?: Record<string, string | number>) => string };
const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('ru');

  useEffect(() => { 
    const saved = localStorage.getItem('bubbleBlastArenaLang'); 
    if (saved && saved in translations) setLanguageState(saved as Language); 
  }, []);

  const setLanguage = useCallback((lang: string) => {
    const supported = lang in translations ? lang : 'ru';
    localStorage.setItem('bubbleBlastArenaLang', supported);
    setLanguageState(supported as Language);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) return key;
    }
    if (typeof result === 'string' && params) {
      let str = result;
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
      }
      return str;
    }
    return typeof result === 'string' ? result : key;
  }, [language]);

  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => { 
  const ctx = useContext(I18nContext); 
  if (!ctx) throw new Error('useI18n: must be used within I18nProvider'); 
  return ctx; 
};

export const LanguageManager = () => { 
  const { language } = useI18n(); 
  useEffect(() => { 
    document.documentElement.lang = language; 
  }, [language]); 
  return null; 
};
