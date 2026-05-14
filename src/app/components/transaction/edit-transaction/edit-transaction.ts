import { Component, OnInit, inject, ChangeDetectorRef, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../services/supabase';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../../constants/categories';

@Component({
  selector: 'app-edit-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-transaction.html'
})
export class EditTransaction implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supabaseService = inject(SupabaseService);
  private cdr = inject(ChangeDetectorRef);
  
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  transactionForm!: FormGroup;
  transactionId!: string;

  expenseCategories = EXPENSE_CATEGORIES;
  incomeCategories = INCOME_CATEGORIES;

  get currentCategories() {
    if (!this.transactionForm) return this.expenseCategories;
    return this.transactionForm.get('type')?.value === 'income' 
      ? this.incomeCategories 
      : this.expenseCategories;
  }

  ngOnInit(): void {
    this.transactionId = this.route.snapshot.paramMap.get('id')!;
    
    this.transactionForm = this.fb.group({
      type: ['expense', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      label: ['', [Validators.required, Validators.minLength(3)]],
      category: [this.expenseCategories[0].id, Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      isRecurring: [false],
      recurrenceInterval: [1, [Validators.min(1)]],
      frequency: ['monthly'],
      endDate: [null]
    });

    this.loadTransaction();

    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      const defaultCategory = type === 'income' ? this.incomeCategories[0].id : this.expenseCategories[0].id;
      this.transactionForm.get('category')?.setValue(defaultCategory);
    });
  }

  async loadTransaction() {
    try {
      const { data, error } = await this.supabaseService.getTransactionById(this.transactionId);
      if (error) throw error;
      if (data) {
        this.transactionForm.patchValue({
          ...data,
          date: typeof data.date === 'string' ? data.date.substring(0, 10) : new Date(data.date).toISOString().substring(0, 10),
          endDate: data.endDate ? (typeof data.endDate === 'string' ? data.endDate.substring(0, 10) : new Date(data.endDate).toISOString().substring(0, 10)) : null,
          recurrenceInterval: data.recurrenceInterval || 1
        }, { emitEvent: false });
      }
    } catch (error) {
      console.error($localize`:@@editTransaction.error.loading:Error while loading the transaction:`, error);
      this.goBack();
    } finally {
      this.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  setType(type: 'expense' | 'income') {
    this.transactionForm.patchValue({ type });
  }

  goBack() {
    this.router.navigate(['/transactions']);
  }

  async onSubmit() {
    if (this.transactionForm.valid) {
      this.isSaving.set(true);
      try {
        const formValue = this.transactionForm.value;
        const updatedTransaction = {
          ...formValue,
          isRecurring: formValue.isRecurring || false,
          frequency: formValue.isRecurring ? formValue.frequency : 'none',
          recurrenceInterval: formValue.isRecurring ? (formValue.recurrenceInterval || 1) : null,
          endDate: formValue.isRecurring && formValue.endDate ? formValue.endDate : null
        };
        
        const { error } = await this.supabaseService.updateTransaction(this.transactionId, updatedTransaction);
        if (error) throw error;
        
        this.goBack();
      } catch (error) {
        console.error($localize`:@@editTransaction.error.updating:Error while updating the transaction:`, error);
      } finally {
        this.isSaving.set(false);
        this.cdr.detectChanges();
      }
    }
  }
}
