import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AddTransactionComponent } from './add-transaction';
import { SupabaseService } from '../../../services/supabase';

describe('AddTransactionComponent', () => {
  let component: AddTransactionComponent;
  let fixture: ComponentFixture<AddTransactionComponent>;
  let router: Router;

  const mockAddTransaction = vi.fn();
  const mockSupabaseService = {
    addTransaction: mockAddTransaction
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15T12:00:00Z'));

    await TestBed.configureTestingModule({
      imports: [AddTransactionComponent],
      providers: [
        provideRouter([]),
        { provide: SupabaseService, useValue: mockSupabaseService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(AddTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization & Validation', () => {
    it('should initialize the form with default values', () => {
      expect(component.transactionForm).toBeDefined();
      expect(component.transactionForm.get('type')?.value).toBe('expense');
      expect(component.transactionForm.get('category')?.value).toBe('Food');
      expect(component.transactionForm.get('date')?.value).toBe('2024-05-15');
      expect(component.transactionForm.get('isRecurring')?.value).toBe(false);
      expect(component.transactionForm.valid).toBe(false); 
    });

    it('should be invalid if required fields are missing', () => {
      component.transactionForm.controls['amount'].setValue(null);
      component.transactionForm.controls['label'].setValue('');

      expect(component.transactionForm.invalid).toBe(true);
    });

    it('should be valid if all required fields are filled correctly', () => {
      component.transactionForm.controls['amount'].setValue(100);
      component.transactionForm.controls['label'].setValue('Groceries');

      expect(component.transactionForm.valid).toBe(true);
    });

    it('should update category when type changes', () => {
      component.setType('income');
      expect(component.transactionForm.get('type')?.value).toBe('income');
      expect(component.transactionForm.get('category')?.value).toBe('Salary');

      component.setType('expense');
      expect(component.transactionForm.get('type')?.value).toBe('expense');
      expect(component.transactionForm.get('category')?.value).toBe('Food');
    });
  });

  describe('Submit Logic (onSubmit)', () => {
    it('should not call Supabase if the form is invalid', async () => {
      component.transactionForm.controls['amount'].setValue(null);

      await component.onSubmit();

      expect(mockAddTransaction).not.toHaveBeenCalled();
    });

    it('should format transaction payload properly and call Supabase on success', async () => {
      component.transactionForm.controls['amount'].setValue(50);
      component.transactionForm.controls['label'].setValue('Internet Bill');
      component.transactionForm.controls['isRecurring'].setValue(true);
      component.transactionForm.controls['frequency'].setValue('monthly');
      component.transactionForm.controls['recurrenceInterval'].setValue(1);

      mockAddTransaction.mockResolvedValue({ error: null });

      const promise = component.onSubmit();
      expect(component.isLoading()).toBe(true);

      await promise;

      expect(mockAddTransaction).toHaveBeenCalledWith(expect.objectContaining({
        type: 'expense',
        amount: 50,
        label: 'Internet Bill',
        category: 'Food',
        isRecurring: true,
        frequency: 'monthly',
        recurrenceInterval: 1
      }));

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(component.isLoading()).toBe(false);
    });

    it('should log error if Supabase request fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      component.transactionForm.controls['amount'].setValue(50);
      component.transactionForm.controls['label'].setValue('Internet Bill');

      const mockError = new Error('Database Error');
      mockAddTransaction.mockResolvedValue({ error: mockError });

      await component.onSubmit();

      expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de l\'ajout de la transaction:', mockError);
      expect(router.navigate).not.toHaveBeenCalled();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('HTML Template Rendering', () => {
    it('should disable submit button when form is invalid', () => {
      component.transactionForm.controls['amount'].setValue(null);
      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
      expect(buttonEl.disabled).toBe(true);
    });

    it('should disable submit button and change text when loading', () => {
      component.transactionForm.controls['amount'].setValue(100);
      component.transactionForm.controls['label'].setValue('Valid');
      component.isLoading.set(true);

      fixture.detectChanges();

      const buttonEl = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
      expect(buttonEl.disabled).toBe(true);
      expect(buttonEl.textContent.trim()).toBe('Saving...');
    });

    it('should call goBack when Cancel is clicked', () => {
      const goBackSpy = vi.spyOn(component, 'goBack');
      const cancelButtonEl = fixture.debugElement.query(By.css('button.text-gray-500')).nativeElement;

      cancelButtonEl.click();

      expect(goBackSpy).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });
});
