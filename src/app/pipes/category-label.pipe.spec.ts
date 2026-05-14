import { describe, it, expect, beforeEach } from 'vitest';
import { CategoryLabelPipe } from './category-label.pipe';

describe('CategoryLabelPipe', () => {
  let pipe: CategoryLabelPipe;

  beforeEach(() => {
    pipe = new CategoryLabelPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform category ID to label', () => {
    expect(pipe.transform('food')).toBe('Food');
    expect(pipe.transform('salary')).toBe('Salary');
  });

  it('should return ID if category is unknown', () => {
    expect(pipe.transform('unknown')).toBe('unknown');
  });
});
