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
  
  viewMode: 'week' | 'month' | 'year' = 'month';
  currentDate: Date = new Date();
  periodLabel: string = '';

  async ngOnInit() {
    await this.loadTransactions();
  }

  async loadTransactions() {
    this.isLoading = true;
    try {
      const { start, end, label } = this.getPeriodDates();
      this.periodLabel = label;
      
      const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

      const { data, error } = await this.supabaseService.getTransactions(startStr, endStr);
      if (error) throw error;
      
      if (data) {
        const expandedData = this.recurrenceService.expandTransactions(data as Transaction[], end);
        
        const currentMonthData = expandedData.filter(t => {
          const dateStr = typeof t.date === 'string' ? t.date : t.date.toISOString();
          const [y, m, d] = dateStr.substring(0, 10).split('-').map(Number);
          const tDate = new Date(y, m - 1, d, 12, 0, 0);
          return tDate >= start && tDate <= end;
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

  getPeriodDates() {
    const d = new Date(this.currentDate);
    const y = d.getFullYear();
    const m = d.getMonth();
    let start: Date, end: Date, label: string;

    if (this.viewMode === 'month') {
      start = new Date(y, m, 1, 0, 0, 0);
      end = new Date(y, m + 1, 0, 23, 59, 59);
      label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (this.viewMode === 'year') {
      start = new Date(y, 0, 1, 0, 0, 0);
      end = new Date(y, 11, 31, 23, 59, 59);
      label = y.toString();
    } else {
      const day = d.getDay() || 7;
      start = new Date(y, m, d.getDate() - day + 1, 0, 0, 0);
      end = new Date(start.getTime());
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      
      const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      if (start.getFullYear() !== end.getFullYear()) {
         label = `${start.toLocaleDateString('en-US', { ...formatOpts, year: 'numeric' })} - ${end.toLocaleDateString('en-US', { ...formatOpts, year: 'numeric' })}`;
      } else {
         label = `${start.toLocaleDateString('en-US', formatOpts)} - ${end.toLocaleDateString('en-US', { ...formatOpts, year: 'numeric' })}`;
      }
    }
    return { start, end, label };
  }

  previousPeriod() {
    if (this.viewMode === 'month') this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    else if (this.viewMode === 'year') this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
    else this.currentDate.setDate(this.currentDate.getDate() - 7);
    this.loadTransactions();
  }

  nextPeriod() {
    if (this.viewMode === 'month') this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    else if (this.viewMode === 'year') this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
    else this.currentDate.setDate(this.currentDate.getDate() + 7);
    this.loadTransactions();
  }

  setViewMode(mode: string) {
    this.viewMode = mode as 'week' | 'month' | 'year';
    this.currentDate = new Date();
    this.loadTransactions();
  }

  onAddTransaction() {
    this.router.navigate(['/add-transaction']);
  }
}