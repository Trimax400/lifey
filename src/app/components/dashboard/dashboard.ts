import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PieChartComponent } from '../pie-chart/pie-chart';
import { SupabaseService } from '../../services/supabase';
import { Transaction } from '../../models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PieChartComponent],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  income: number = 0;
  expenses: number = 0;
  balance: number = 0;
  majorExpenses: Transaction[] = [];
  pieChartData: { label: string, value: number }[] = [];
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit() {
    await this.loadTransactions();
  }

  async loadTransactions() {
    this.isLoading = true;
    try {
      const { data, error } = await this.supabaseService.getTransactions();
      if (error) throw error;
      
      if (data) {
        this.calculateMetrics(data as Transaction[]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  calculateMetrics(transactions: Transaction[]) {
    this.income = 0;
    this.expenses = 0;
    const expenseList: Transaction[] = [];
    const categoryMap = new Map<string, number>();

    transactions.forEach(t => {
      const amountAsNumber = Number(t.amount); 

      if (t.type === 'income') {
        this.income += amountAsNumber;
      } else {
        this.expenses += amountAsNumber;
        expenseList.push({ ...t, amount: amountAsNumber });
        
        const categoryName = t.category || 'Other';
        const currentCategoryAmount = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, currentCategoryAmount + amountAsNumber);
      }
    });

    this.balance = this.income - this.expenses;

    this.majorExpenses = expenseList
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    this.pieChartData = Array.from(categoryMap.entries()).map(([label, value]) => ({ label, value }));
  }

  onAddTransaction() {
    this.router.navigate(['/add-transaction']);
  }
}