import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PieChartComponent } from '../pie-chart/pie-chart';
import { SupabaseService } from '../../services/supabase';
import { Transaction } from '../../models/transaction.model';
import { RecurrenceService } from '../../services/recurrence';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PieChartComponent],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private supabaseService = inject(SupabaseService);
  private recurrenceService = inject(RecurrenceService);

  income: number = 0;
  expenses: number = 0;
  balance: number = 0;
  majorExpenses: Transaction[] = [];
  pieChartData: { label: string, value: number }[] = [];
  isLoading: boolean = true;
  projectedData: { month: string, amount: number, percentage: number, isPositive: boolean, transactions: Transaction[] }[] = [];
  selectedMonth: { month: string, transactions: Transaction[] } | null = null;

  async ngOnInit() {
    await this.loadTransactions();
  }

  async loadTransactions() {
    this.isLoading = true;
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
      
      const startOfMonth = `${year}-${month}-01`;
      const endOfMonthStr = `${year}-${month}-${lastDay}`;

      const { data, error } = await this.supabaseService.getTransactions(startOfMonth, endOfMonthStr);
      if (error) throw error;
      
      if (data) {
        const endOfMonth = new Date(year, now.getMonth() + 1, 0, 23, 59, 59);
        
        const expandedData = this.recurrenceService.expandTransactions(data as Transaction[], endOfMonth);
        
        const currentMonthPrefix = `${year}-${month}`;
        const currentMonthData = expandedData.filter(t => {
          const dateStr = typeof t.date === 'string' ? t.date : t.date.toISOString();
          return dateStr.startsWith(currentMonthPrefix);
        });

        this.calculateMetrics(currentMonthData);
        this.calculateProjections(data as Transaction[]);
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

  calculateProjections(transactions: Transaction[]) {
    const now = new Date();
    const projectionEnd = new Date(now.getFullYear(), now.getMonth() + 7, 0, 23, 59, 59);
    
    const recurringOnly = transactions.filter(t => t.isRecurring);
    const expanded = this.recurrenceService.expandTransactions(recurringOnly, projectionEnd);
    
    const monthlyNet = new Map<string, number>();
    const monthlyTxs = new Map<string, Transaction[]>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const projectionMonths: string[] = [];
    
    for (let i = 1; i <= 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyNet.set(key, 0);
      monthlyTxs.set(key, []);
      projectionMonths.push(key);
    }

    expanded.forEach(t => {
      const dateStr = typeof t.date === 'string' ? t.date : t.date.toISOString();
      const monthKey = dateStr.substring(0, 7);
      if (monthlyNet.has(monthKey)) {
        const amount = Number(t.amount);
        const current = monthlyNet.get(monthKey) || 0;
        monthlyNet.set(monthKey, current + (t.type === 'income' ? amount : -amount));
        monthlyTxs.get(monthKey)?.push(t);
      }
    });


    const maxAbs = Math.max(...Array.from(monthlyNet.values()).map(val => Math.abs(val)));
    const maxProjectedAmount = maxAbs > 0 ? maxAbs : 1;

    this.projectedData = projectionMonths.map(key => {
      const [y, m] = key.split('-');
      const monthLabel = monthNames[parseInt(m, 10) - 1];
      const amount = monthlyNet.get(key) || 0;
      return {
        month: monthLabel,
        amount: amount,
        percentage: (Math.abs(amount) / maxProjectedAmount) * 100,
        isPositive: amount >= 0,
        transactions: monthlyTxs.get(key) || []
      };
    });
  }

  openMonthDetails(month: string, transactions: Transaction[]) {
    this.selectedMonth = { month, transactions };
  }

  closeMonthDetails() {
    this.selectedMonth = null;
  }

  onAddTransaction() {
    this.router.navigate(['/add-transaction']);
  }
}