import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-transaction.html'
})
export class AddTransactionComponent implements OnInit {
  transactionForm!: FormGroup;

  expenseCategories = ['Food', 'Housing', 'Transport', 'Health', 'Entertainment', 'Subscriptions', 'Other'];
  incomeCategories = ['Salary', 'Bonus', 'Refund', 'Sales', 'Other'];

  get currentCategories(): string[] {
    if (!this.transactionForm) return this.expenseCategories;
    return this.transactionForm.get('type')?.value === 'income' 
      ? this.incomeCategories 
      : this.expenseCategories;
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.transactionForm = this.fb.group({
      type: ['expense', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      label: ['', [Validators.required, Validators.minLength(3)]],
      category: ['Food', Validators.required],
      date: [new Date().toISOString().substring(0, 10), Validators.required]
    });

    this.transactionForm.get('type')?.valueChanges.subscribe(type => {
      const defaultCategory = type === 'income' ? 'Salary' : 'Food';
      this.transactionForm.get('category')?.setValue(defaultCategory);
    });
  }

  setType(type: 'expense' | 'income') {
    this.transactionForm.patchValue({ type });
  }

  onSubmit() {
    if (this.transactionForm.valid) {
      console.log('Data to save:', this.transactionForm.value);
    }
  }
}