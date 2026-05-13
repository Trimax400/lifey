import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { EditTransaction } from './edit-transaction';
import { SupabaseService } from '../../../services/supabase';

describe('EditTransaction', () => {
  let component: EditTransaction;
  let fixture: ComponentFixture<EditTransaction>;
  let router: Router;

  const mockGetTransactionById = vi.fn();
  const mockUpdateTransaction = vi.fn();

  const mockSupabaseService = {
    getTransactionById: mockGetTransactionById,
    updateTransaction: mockUpdateTransaction
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15T12:00:00Z'));

    mockGetTransactionById.mockResolvedValue({
      data: {
        id: '123',
        type: 'expense',
        amount: 100,
        label: 'Test Dinner',
        category: 'food',
        date: '2024-05-10T20:00:00.000Z',
        isRecurring: false
      },
      error: null
    });

    await TestBed.configureTestingModule({
      imports: [EditTransaction],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: SupabaseService, useValue: mockSupabaseService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '123' } }
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(EditTransaction);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization & Loading', () => {
    it('should create the component and load the transaction data into the form', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();

      expect(component).toBeTruthy();
      expect(mockGetTransactionById).toHaveBeenCalledWith('123');
      expect(component.isLoading()).toBe(false);
      
      expect(component.transactionForm.value).toEqual(expect.objectContaining({
        type: 'expense',
        amount: 100,
        label: 'Test Dinner',
        category: 'food',
        date: '2024-05-10',
        isRecurring: false
      }));
    });

    it('should navigate back if loading the transaction fails', async () => {
      mockGetTransactionById.mockRejectedValue(new Error('Network Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      fixture.detectChanges();
      await vi.runAllTimersAsync();

      expect(consoleSpy).toHaveBeenCalledWith('Error while loading the transaction:', expect.any(Error));
      expect(router.navigate).toHaveBeenCalledWith(['/transactions']);
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Submit Logic (onSubmit)', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();
    });

    it('should not call updateTransaction if form is invalid', async () => {
      component.transactionForm.controls['amount'].setValue(-50);
      await component.onSubmit();
      expect(mockUpdateTransaction).not.toHaveBeenCalled();
    });

    it('should call Supabase and navigate back on successful update', async () => {
      component.transactionForm.controls['amount'].setValue(200);
      component.transactionForm.controls['label'].setValue('Updated Label');
      mockUpdateTransaction.mockResolvedValue({ error: null });

      const promise = component.onSubmit();
      expect(component.isSaving()).toBe(true);

      await promise;

      expect(mockUpdateTransaction).toHaveBeenCalledWith('123', expect.objectContaining({
        amount: 200,
        label: 'Updated Label'
      }));
      expect(component.isSaving()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/transactions']);
    });
  });

  describe('HTML Template Rendering', () => {
    it('should disable submit button when form is invalid or saving', async () => {
      fixture.detectChanges();
      await vi.runAllTimersAsync();
      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
      expect(buttonEl.disabled).toBe(false);

      component.transactionForm.controls['amount'].setValue(null);
      fixture.detectChanges();
      expect(buttonEl.disabled).toBe(true);

      component.transactionForm.controls['amount'].setValue(100);
      component.isSaving.set(true);
      fixture.detectChanges();
      expect(buttonEl.disabled).toBe(true);
      expect(buttonEl.textContent.trim()).toBe('Updating...');
    });
  });
});
