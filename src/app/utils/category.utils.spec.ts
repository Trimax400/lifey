import { describe, it, expect } from 'vitest';
import { getCategoryLabel } from './category.utils';

describe('Category Utils', () => {
  describe('getCategoryLabel', () => {
    it('should return the correct label for a valid expense category ID', () => {
      // In tests without translation, it returns the source label
      expect(getCategoryLabel('food')).toBe('Food');
      expect(getCategoryLabel('transport')).toBe('Transport');
    });

    it('should return the correct label for a valid income category ID', () => {
      expect(getCategoryLabel('salary')).toBe('Salary');
      expect(getCategoryLabel('bonus')).toBe('Bonus');
    });

    it('should return the ID itself if the category is not found', () => {
      expect(getCategoryLabel('unknown-id')).toBe('unknown-id');
    });

    it('should handle "other" category from both lists', () => {
      // Both lists have 'other', it should find the first one or just return 'Other'
      expect(getCategoryLabel('other')).toBe('Other');
    });
  });
});
