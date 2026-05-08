import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class RecurrenceService {

  expandTransactions(transactions: Transaction[], upToDate: Date = new Date()): Transaction[] {
    const allTransactions: Transaction[] = [...transactions];

    const recurringOriginals = transactions.filter(t => 
      t.isRecurring && t.frequency && t.frequency !== 'none'
    );

    recurringOriginals.forEach(original => {
      let limitDate = upToDate;
      if (original.endDate) {
        const endStr = typeof original.endDate === 'string' ? original.endDate : original.endDate.toISOString();
        const [ey, em, ed] = endStr.substring(0, 10).split('-').map(Number);
        const parsedEndDate = new Date(ey, em - 1, ed, 23, 59, 59);
        if (parsedEndDate < upToDate) {
          limitDate = parsedEndDate;
        }
      }
      
      const interval = original.recurrenceInterval || 1;
      let i = 1;
      while (true) {
        const dateStr = typeof original.date === 'string' ? original.date : original.date.toISOString();
        const [y, m, d] = dateStr.substring(0, 10).split('-').map(Number);
        const nextDate = new Date(y, m - 1, d, 12, 0, 0);
        
        if (original.frequency === 'weekly') {
          nextDate.setDate(nextDate.getDate() + (7 * i * interval));
        } else if (original.frequency === 'monthly') {
          const expectedMonth = nextDate.getMonth() + (i * interval);
          nextDate.setMonth(expectedMonth);
          if (nextDate.getMonth() !== (expectedMonth % 12)) {
            nextDate.setDate(0); 
          }
        } else if (original.frequency === 'yearly') {
          nextDate.setFullYear(nextDate.getFullYear() + (i * interval));
        }

        if (nextDate > limitDate) break;

        const yearStr = nextDate.getFullYear();
        const monthStr = String(nextDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(nextDate.getDate()).padStart(2, '0');

        allTransactions.push({
          ...original,
          id: `${original.id}-recur-${i}`,
          date: `${yearStr}-${monthStr}-${dayStr}`,
        });
        
        i++;
      }
    });

    return allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}