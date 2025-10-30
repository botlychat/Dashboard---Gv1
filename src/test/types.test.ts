import { describe, it, expect } from 'vitest';
import { formatCurrency, currencySymbols } from '../../types';

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    it('formats amount with English currency symbols', () => {
      const result = formatCurrency(1500, 'SAR', 'en');
      expect(result).toBe('1,500 SAR');
    });

    it('formats amount with Arabic currency symbols', () => {
      const result = formatCurrency(1500, 'SAR', 'ar');
      expect(result).toBe('1,500 ر.س');
    });

    it('handles different currencies correctly', () => {
      expect(formatCurrency(1000, 'USD', 'en')).toBe('1,000 USD');
      expect(formatCurrency(1000, 'EUR', 'en')).toBe('1,000 EUR');
      expect(formatCurrency(1000, 'AED', 'ar')).toBe('1,000 د.إ');
    });

    it('formats large numbers with commas', () => {
      const result = formatCurrency(1234567, 'SAR', 'en');
      expect(result).toBe('1,234,567 SAR');
    });
  });

  describe('currencySymbols', () => {
    it('has symbols for all supported currencies in English', () => {
      expect(currencySymbols.en.SAR).toBe('SAR');
      expect(currencySymbols.en.USD).toBe('USD');
      expect(currencySymbols.en.EUR).toBe('EUR');
    });

    it('has symbols for all supported currencies in Arabic', () => {
      expect(currencySymbols.ar.SAR).toBe('ر.س');
      expect(currencySymbols.ar.AED).toBe('د.إ');
      expect(currencySymbols.ar.USD).toBe('$');
    });
  });
});
