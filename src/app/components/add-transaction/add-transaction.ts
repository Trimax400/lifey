import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-transaction.html'
})
export class AddTransactionComponent implements OnInit {
  private fb = inject(FormBuilder)
  private router = inject(Router)
  private supabaseService = inject(SupabaseService)
  
  isLoading: boolean = false;
  transactionForm!: FormGroup;

  expenseCategories = ['Food', 'Housing', 'Transport', 'Health', 'Entertainment', 'Subscriptions', 'Other'];
  incomeCategories = ['Salary', 'Bonus', 'Refund', 'Sales', 'Other'];

  get currentCategories(): string[] {
    if (!this.transactionForm) return this.expenseCategories;
    return this.transactionForm.get('type')?.value === 'income' 
      ? this.incomeCategories 
      : this.expenseCategories;
  }


  ngOnInit(): void {
    this.transactionForm = this.fb.group({
      type: ['expense', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      label: ['', [Validators.required, Validators.minLength(3)]],
      category: ['Food', Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required],
      isRecurring: [false],
      recurrenceInterval: [1, [Validators.min(1)]],
      frequency: ['monthly'],
      endDate: [null]
    });

    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      const defaultCategory = type === 'income' ? 'Salary' : 'Food';
      this.transactionForm.get('category')?.setValue(defaultCategory);
    });
  }

  setType(type: 'expense' | 'income') {
    this.transactionForm.patchValue({ type });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  async onSubmit() {
    if (this.transactionForm.valid) {
      this.isLoading = true;
      try {
        const formValue = this.transactionForm.value;
        const newTransaction = {
          ...formValue,
          isRecurring: formValue.isRecurring || false,
          frequency: formValue.isRecurring ? formValue.frequency : 'none',
          recurrenceInterval: formValue.isRecurring ? (formValue.recurrenceInterval || 1) : null,
          endDate: formValue.isRecurring && formValue.endDate ? formValue.endDate : null
        };
        
        const { error } = await this.supabaseService.addTransaction(newTransaction);
        if (error) throw error;
        
        this.router.navigate(['/dashboard']);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la transaction:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }
}