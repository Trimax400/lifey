import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Transactions } from './transactions';
import { SupabaseService } from '../../../services/supabase';
import { RecurrenceService } from '../../../services/recurrence';

describe('TransactionsComponent', () => {
  let component: Transactions;
  let fixture: ComponentFixture<Transactions>;
  let router: Router;

  const mockGetTransactions = vi.fn();
  const mockDeleteTransaction = vi.fn();
  const mockExpandTransactions = vi.fn();

  const mockSupabaseService = {
    getTransactions: mockGetTransactions,
    deleteTransaction: mockDeleteTransaction
  };
  
  const mockRecurrenceService = {
    expandTransactions: mockExpandTransactions
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15T12:00:00Z'));

    mockGetTransactions.mockResolvedValue({ data: [], error: null });
    mockExpandTransactions.mockReturnValue([]);

    await TestBed.configureTestingModule({
      imports: [Transactions],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: RecurrenceService, useValue: mockRecurrenceService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    fixture = TestBed.createComponent(Transactions);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization & Loading', () => {
    it('should create the component and load initial data', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      expect(component).toBeTruthy();
      expect(mockGetTransactions).toHaveBeenCalled(); 
      expect(component.isLoading()).toBe(false);
    });

    it('should handle errors gracefully during transactions loading', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockGetTransactions.mockRejectedValue(new Error('Network Error'));
      
      fixture.detectChanges();
      await vi.runAllTimersAsync();
      
      expect(consoleSpy).toHaveBeenCalledWith('Error while fetching transactions:', expect.any(Error));
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Interactions & Navigation', () => {
    it('should change view mode and reload transactions', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      mockGetTransactions.mockClear();

      component.setViewMode('year');
      expect(component.viewMode()).toBe('year');
      
      await vi.runAllTimersAsync();
      expect(mockGetTransactions).toHaveBeenCalled();
    });

    it('should navigate to previous and next periods based on the view mode', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      const initialMonth = new Date(component.currentDate()).getMonth();

      component.previousPeriod();
      expect(component.currentDate().getMonth()).toBe(initialMonth - 1);

      component.nextPeriod();
      component.nextPeriod();
      expect(component.currentDate().getMonth()).toBe(initialMonth + 1);
    });

    it('should filter transactions correctly', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      mockGetTransactions.mockClear();

      component.setFilterType('recurring');
      expect(component.filterType()).toBe('recurring');

      await vi.runAllTimersAsync();
      expect(mockGetTransactions).toHaveBeenCalled();
    });
  });

  describe('CRUD Actions', () => {
    it('should navigate to edit page with correct real ID', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      component.editTransaction('123-recur-1');
      expect(router.navigate).toHaveBeenCalledWith(['/edit-transaction', '123']);
    });

    it('should delete a transaction and reload if confirmed', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();
      
      mockGetTransactions.mockClear();
      mockDeleteTransaction.mockResolvedValue({ error: null });

      await component.deleteTransaction('456-recur-1');

      expect(window.confirm).toHaveBeenCalled();
      expect(mockDeleteTransaction).toHaveBeenCalledWith('456');
      expect(mockGetTransactions).toHaveBeenCalled();
    });
  });
});
