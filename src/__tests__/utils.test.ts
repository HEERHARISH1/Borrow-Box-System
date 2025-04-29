import react from 'react';
import '@testing-library/jest-dom';

import { cn, formatCurrency, formatDate, PRODUCT_CATEGORIES } from '../lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges and dedups class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
      expect(cn('foo', 'foo', 'bar')).toBe('foo foo bar');
    });
  });

  describe('formatCurrency', () => {
    it('formats number to USD currency', () => {
      expect(formatCurrency(1234.5)).toBe('$1,234.50');
    });
  });

  describe('formatDate', () => {
    it('formats Date object correctly', () => {
      const date = new Date('2020-01-02T00:00:00Z');
      expect(formatDate(date)).toBe('January 2, 2020');

    });


    it('formats date string correctly', () => {
      expect(formatDate('2021-12-25')).toBe('December 25, 2021');

    });

    it('formats timestamp number correctly', () => {
      expect(formatDate(0)).toBe('January 1, 1970');
    });
  });
  

  describe('PRODUCT_CATEGORIES', () => {
    it('contains expected categories and length', () => {
      expect(PRODUCT_CATEGORIES).toContain('Electronics');
      expect(PRODUCT_CATEGORIES.length).toBe(10);
    });
  });
});
