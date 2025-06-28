import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend) // JSON 파일 로딩용
  .use(LanguageDetector) // 언어 자동 감지
  .use(initReactI18next) // react-i18next 연결
  .init({
    fallbackLng: 'en', // 기본 언어
    debug: true,
    interpolation: {
      escapeValue: false, // react는 자동으로 escape
    },

    react: {
      useSuspense: false, // ✅ 초기 번역이 없을 때 깨지는 문제 방지
    },
  });

export default i18n;