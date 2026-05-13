import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DashboardComponent } from './dashboard';
import { SupabaseService } from '../../services/supabase';
import { RecurrenceService } from '../../services/recurrence';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let router: Router;

  const mockGetTransactions = vi.fn();
  const mockExpandTransactions = vi.fn();

  const mockSupabaseService = { 
    getTransactions: mockGetTransactions 
  };
  
  const mockRecurrenceService = { 
    expandTransactions: mockExpandTransactions 
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15T12:00:00Z'));

    const mockRouter = { navigate: vi.fn() };

    mockGetTransactions.mockResolvedValue({ data: [], error: null });
    mockExpandTransactions.mockReturnValue([]);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: RecurrenceService, useValue: mockRecurrenceService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization & Loading', () => {
    it('should create the component and load initial data', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      expect(component).toBeTruthy();
      expect(mockGetTransactions).toHaveBeenCalledTimes(2); 
      expect(component.isLoading()).toBe(false);
      expect(component.periodLabel()).toBeTruthy();
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

  describe('Metrics Calculation', () => {
    it('should correctly calculate income, expenses, balance, and savings rate', async () => {
      const mockTxs = [
        { id: 1, type: 'income', amount: 3000, category: 'salary', isRecurring: true, date: new Date('2024-05-10T12:00:00Z') },
        { id: 2, type: 'expense', amount: 1000, category: 'housing', isRecurring: true, date: new Date('2024-05-11T12:00:00Z') },
        { id: 3, type: 'expense', amount: 500, category: 'food', isRecurring: false, date: new Date('2024-05-12T12:00:00Z') }
      ];

      mockGetTransactions.mockResolvedValue({ data: mockTxs, error: null });
      mockExpandTransactions.mockReturnValue(mockTxs);

      fixture.detectChanges();
      await vi.runAllTimersAsync();

      expect(component.income()).toBe(3000);
      expect(component.expenses()).toBe(1500);
      expect(component.balance()).toBe(1500);
      expect(component.savingsRate()).toBe(50);

      expect(component.majorIncomes().length).toBe(1);
      expect(component.majorExpenses().length).toBe(2);
    });

    it('should handle zero income gracefully (0% savings rate)', async () => {
      const mockTxs = [
        { id: 1, type: 'expense', amount: 500, category: 'food', isRecurring: false, date: new Date('2024-05-12T12:00:00Z') }
      ];

      mockGetTransactions.mockResolvedValue({ data: mockTxs, error: null });
      mockExpandTransactions.mockReturnValue(mockTxs);

      fixture.detectChanges();
      await vi.runAllTimersAsync();

      expect(component.income()).toBe(0);
      expect(component.expenses()).toBe(500);
      expect(component.balance()).toBe(-500);
      expect(component.savingsRate()).toBe(0);
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

    it('should toggle major list view between expenses and income', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      expect(component.majorListView()).toBe('expenses');
      expect(component.displayedMajorTransactions()).toEqual(component.majorExpenses());
      
      component.majorListView.set('income');
      expect(component.displayedMajorTransactions()).toEqual(component.majorIncomes());
    });

    it('should navigate to add-transaction page when clicking the FAB button', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      component.onAddTransaction();
      expect(router.navigate).toHaveBeenCalledWith(['/add-transaction']);
    });

    it('should open and close the month details modal', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      expect(component.selectedMonth()).toBeNull();

      component.openMonthDetails('May', []);
      expect(component.selectedMonth()).toEqual({ month: 'May', transactions: [] });

      component.closeMonthDetails();
      expect(component.selectedMonth()).toBeNull();
    });
  });

  describe('HTML Template Rendering', () => {
    it('should show loading spinner when isLoading is true', async () => {
      component.isLoading.set(true);
      fixture.detectChanges();
      
      const spinner = fixture.debugElement.query(By.css('.animate-spin'));
      expect(spinner).toBeTruthy();
    });

    it('should display calculated metrics correctly in the DOM', async () => {
      const mockTxs = [
        { id: 1, type: 'income', amount: 2000, category: 'salary', isRecurring: true, date: new Date('2024-05-10T12:00:00Z') },
        { id: 2, type: 'expense', amount: 500, category: 'food', isRecurring: false, date: new Date('2024-05-11T12:00:00Z') }
      ];

      mockGetTransactions.mockResolvedValue({ data: mockTxs, error: null });
      mockExpandTransactions.mockReturnValue(mockTxs);

      fixture.detectChanges();
      await vi.runAllTimersAsync();
      fixture.detectChanges();

      const metricsEl = fixture.debugElement.queryAll(By.css('.text-3xl.font-bold'));

      expect(metricsEl[0].nativeElement.textContent).toContain('2,000');
      expect(metricsEl[1].nativeElement.textContent).toContain('500');
      expect(metricsEl[2].nativeElement.textContent).toContain('1,500');
    });
  });
});

