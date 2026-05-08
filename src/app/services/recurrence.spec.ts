import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { RecurrenceService } from './recurrence';
import { Transaction } from '../models/transaction.model';

describe('RecurrenceService', () => {
  let service: RecurrenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecurrenceService]
    });
    service = TestBed.inject(RecurrenceService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('expandTransactions()', () => {
    
    it('should not expand non-recurring transactions', () => {
      const txs = [
        { id: '1', date: '2024-01-01', amount: 100, isRecurring: false }
      ] as Transaction[];

      const result = service.expandTransactions(txs, new Date('2024-02-01'));
      
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('1');
    });

    it('should expand weekly transactions correctly up to the limit date', () => {
      const txs = [
        { id: '1', date: '2024-01-01', amount: 50, isRecurring: true, frequency: 'weekly', recurrenceInterval: 1 }
      ] as Transaction[];

      const result = service.expandTransactions(txs, new Date('2024-01-16T12:00:00Z'));
      
      expect(result.length).toBe(3);
      expect(result[0].id).toBe('1-recur-2');
      expect(result[0].date).toBe('2024-01-15');
      expect(result[1].id).toBe('1-recur-1');
      expect(result[1].date).toBe('2024-01-08');
      expect(result[2].id).toBe('1');
    });

    it('should expand monthly transactions correctly with intervals', () => {
      const txs = [
        { id: '2', date: '2024-01-15', amount: 100, isRecurring: true, frequency: 'monthly', recurrenceInterval: 2 }
      ] as Transaction[];

      const result = service.expandTransactions(txs, new Date('2024-06-01T12:00:00Z'));
      
      expect(result.length).toBe(3);
      expect(result[0].date).toBe('2024-05-15');
      expect(result[1].date).toBe('2024-03-15');
      expect(result[2].date).toBe('2024-01-15');
    });

    it('should stop expanding if the transaction has an endDate prior to upToDate', () => {
      const txs = [
        { 
          id: '3', 
          date: '2024-01-01', 
          amount: 20, 
          isRecurring: true, 
          frequency: 'monthly', 
          recurrenceInterval: 1,
          endDate: '2024-03-10'
        }
      ] as Transaction[];

      const result = service.expandTransactions(txs, new Date('2024-12-31T12:00:00Z'));
      
      expect(result.length).toBe(3);
      expect(result[0].date).toBe('2024-03-01');
      expect(result[1].date).toBe('2024-02-01');
      expect(result[2].date).toBe('2024-01-01');
    });
  });
});
