import { Category } from '../models/category.model';

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', label: $localize`:@@category.food:Food` },
  { id: 'housing', label: $localize`:@@category.housing:Housing` },
  { id: 'transport', label: $localize`:@@category.transport:Transport` },
  { id: 'health', label: $localize`:@@category.health:Health` },
  { id: 'entertainment', label: $localize`:@@category.entertainment:Entertainment` },
  { id: 'subscriptions', label: $localize`:@@category.subscriptions:Subscriptions` },
  { id: 'other', label: $localize`:@@category.other:Other` }
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', label: $localize`:@@category.salary:Salary` },
  { id: 'bonus', label: $localize`:@@category.bonus:Bonus` },
  { id: 'refund', label: $localize`:@@category.refund:Refund` },
  { id: 'sales', label: $localize`:@@category.sales:Sales` },
  { id: 'other', label: $localize`:@@category.other:Other` }
];
