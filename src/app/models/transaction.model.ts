export type RecurrenceFrequency = 'none' | 'weekly' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  label: string;
  category: string;
  date: Date;
  isRecurring: boolean;
  frequency?: RecurrenceFrequency;
  endDate?: Date;
}