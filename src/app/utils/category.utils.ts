import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';

export function getCategoryLabel(id: string): string {
  const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  const cat = all.find(c => c.id === id);
  return cat ? cat.label : id;
}
