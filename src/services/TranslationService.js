import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TranslationService {
  constructor() {
    this.localesPath = path.join(__dirname, '..', 'locales');
    this.translations = {};
    this.supportedLocales = ['en', 'mk'];
    this.defaultLocale = 'en';
  }

  /**
   * Load translations for a specific locale
   * @param {string} locale - Locale code (e.g., 'en', 'mk')
   * @returns {Object} Translation object
   */
  async loadTranslations(locale) {
    // Validate locale
    if (!this.supportedLocales.includes(locale)) {
      console.warn(`Locale "${locale}" not supported, falling back to "${this.defaultLocale}"`);
      locale = this.defaultLocale;
    }

    // Check if already loaded
    if (this.translations[locale]) {
      return this.translations[locale];
    }

    try {
      const translationPath = path.join(this.localesPath, `${locale}.json`);
      const fileContent = await fs.readFile(translationPath, 'utf-8');
      this.translations[locale] = JSON.parse(fileContent);
      return this.translations[locale];
    } catch (error) {
      console.error(`Error loading translations for locale "${locale}":`, error.message);
      
      // Fallback to default locale
      if (locale !== this.defaultLocale) {
        console.log(`Falling back to default locale: ${this.defaultLocale}`);
        return await this.loadTranslations(this.defaultLocale);
      }
      
      throw new Error(`Failed to load translations for locale "${locale}"`);
    }
  }

  /**
   * Get translations for a locale (alias for loadTranslations)
   * @param {string} locale - Locale code
   * @returns {Object} Translation object
   */
  async getTranslations(locale = 'en') {
    return await this.loadTranslations(locale);
  }

  /**
   * Get a specific translation key
   * @param {string} locale - Locale code
   * @param {string} key - Translation key
   * @param {string} fallback - Fallback value if key not found
   * @returns {string} Translated string
   */
  async translate(locale, key, fallback = null) {
    const translations = await this.loadTranslations(locale);
    return translations[key] || fallback || key;
  }

  /**
   * Get list of supported locales
   * @returns {Array} Array of supported locale codes
   */
  getSupportedLocales() {
    return this.supportedLocales;
  }

  /**
   * Check if a locale is supported
   * @param {string} locale - Locale code to check
   * @returns {boolean} True if supported
   */
  isLocaleSupported(locale) {
    return this.supportedLocales.includes(locale);
  }

  /**
   * Clear cached translations (useful for development/testing)
   */
  clearCache() {
    this.translations = {};
  }
}

export default TranslationService;

