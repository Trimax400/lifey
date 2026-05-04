import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PieChartComponent } from '../charts/pie-chart/pie-chart';
import { LineChartComponent } from '../charts/line-chart/line-chart';
import { SupabaseService } from '../../services/supabase';
import { Transaction } from '../../models/transaction.model';
import { RecurrenceService } from '../../services/recurrence';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PieChartComponent, LineChartComponent],
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
  savingsRate: number = 0;
  majorExpenses: Transaction[] = [];
  majorIncomes: Transaction[] = [];
  pieChartData: { label: string, value: number }[] = [];
  fixedVarChartData: { label: string, value: number }[] = [];
  historyData: { label: string, income: number, expenses: number, balance: number }[] = [];
  historyPaths = { income: '', expenses: '', balance: '' };
  isLoading: boolean = true;
  projectedData: { month: string, amount: number, percentage: number, isPositive: boolean, transactions: Transaction[] }[] = [];
  selectedMonth: { month: string, transactions: Transaction[] } | null = null;
  
  majorListView: 'expenses' | 'income' = 'expenses';
  viewMode: 'week' | 'month' | 'year' = 'month';
  currentDate: Date = new Date();
  periodLabel: string = '';

  async ngOnInit() {
    await this.loadTransactions();
  }

  get displayedMajorTransactions(): Transaction[] {
    return this.majorListView === 'expenses' ? this.majorExpenses : this.majorIncomes;
  }

  async loadTransactions() {
    this.isLoading = true;
    try {
      const { start, end, label } = this.getPeriodDates();
      this.periodLabel = label;
      
      const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

      const historyStart = new Date(end.getFullYear(), end.getMonth() - 5, 1);
      const historyStartStr = `${historyStart.getFullYear()}-${String(historyStart.getMonth() + 1).padStart(2, '0')}-01`;

      const [periodRes, historyRes] = await Promise.all([
        this.supabaseService.getTransactions(startStr, endStr),
        this.supabaseService.getTransactions(historyStartStr, endStr)
      ]);
      
      if (periodRes.data) {
        const expandedData = this.recurrenceService.expandTransactions(periodRes.data as Transaction[], end);
        
        const currentMonthData = expandedData.filter(t => {
          const dateStr = typeof t.date === 'string' ? t.date : t.date.toISOString();
          const [y, m, d] = dateStr.substring(0, 10).split('-').map(Number);
          const tDate = new Date(y, m - 1, d, 12, 0, 0);
          return tDate >= start && tDate <= end;
        });

        this.calculateMetrics(currentMonthData);
        this.calculateProjections(periodRes.data as Transaction[]);
      }

      if (historyRes.data) {
        this.calculateHistory(historyRes.data as Transaction[], end);
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
    const incomeList: Transaction[] = [];
    const categoryMap = new Map<string, number>();
    let fixedExpenses = 0;
    let variableExpenses = 0;

    transactions.forEach(t => {
      const amountAsNumber = Number(t.amount); 

      if (t.type === 'income') {
        this.income += amountAsNumber;
        incomeList.push({ ...t, amount: amountAsNumber });
      } else {
        this.expenses += amountAsNumber;
        expenseList.push({ ...t, amount: amountAsNumber });
        
        const categoryName = t.category || 'Other';
        const currentCategoryAmount = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, currentCategoryAmount + amountAsNumber);

        if (t.isRecurring) {
          fixedExpenses += amountAsNumber;
        } else {
          variableExpenses += amountAsNumber;
        }
      }
    });

    this.balance = this.income - this.expenses;
    
    if (this.income > 0) {
      const savings = Math.max(0, this.balance);
      this.savingsRate = (savings / this.income) * 100;
    } else {
      this.savingsRate = 0;
    }

    this.majorExpenses = expenseList
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    this.majorIncomes = incomeList
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);

    this.pieChartData = Array.from(categoryMap.entries()).map(([label, value]) => ({ label, value }));
    this.fixedVarChartData = [
      { label: 'Fixed', value: fixedExpenses },
      { label: 'Variable', value: variableExpenses }
    ].filter(item => item.value > 0);
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

  calculateHistory(transactions: Transaction[], endDate: Date) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const historyMap = new Map<string, { label: string, income: number, expenses: number, balance: number }>();
    const historyKeys: string[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      historyMap.set(key, { label: monthNames[d.getMonth()], income: 0, expenses: 0, balance: 0 });
      historyKeys.push(key);
    }

    const expanded = this.recurrenceService.expandTransactions(transactions, endDate);

    expanded.forEach(t => {
      const dateStr = typeof t.date === 'string' ? t.date : t.date.toISOString();
      const monthKey = dateStr.substring(0, 7);
      const target = historyMap.get(monthKey);
      if (target) {
        const amount = Number(t.amount);
        if (t.type === 'income') target.income += amount;
        else target.expenses += amount;
      }
    });

    this.historyData = historyKeys.map(key => {
      const item = historyMap.get(key)!;
      item.balance = item.income - item.expenses;
      return item;
    });
    
    this.generateHistoryPaths();
  }

  generateHistoryPaths() {
    if (this.historyData.length < 2) {
      this.historyPaths = { income: '', expenses: '', balance: '' };
      return;
    }
    
    const maxVal = Math.max(...this.historyData.flatMap(d => [d.income, d.expenses, d.balance]), 100);
    const minVal = Math.min(...this.historyData.flatMap(d => [d.income, d.expenses, d.balance]), 0);
    
    const range = (maxVal - minVal) || 1;
    const paddedMin = minVal - (range * 0.1);
    const paddedRange = (maxVal + (range * 0.1)) - paddedMin;

    const height = 120;
    const width = 600;
    const xStep = width / (this.historyData.length - 1);

    const getPoint = (val: number, i: number): [number, number] => {
        const y = height - ((val - paddedMin) / paddedRange) * height;
        const x = i * xStep;
        return [x, y];
    };

    const line = (points: [number, number][]) => {
      const command = (point: [number, number], i: number, a: [number, number][]) => {
        const [cpsX, cpsY] = this.controlPoint(a[i - 1], a[i - 2], point);
        const [cpeX, cpeY] = this.controlPoint(point, a[i - 1], a[i + 1], true);
        return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
      };
      return points.reduce((acc, point, i, a) => i === 0 ? `M ${point[0]},${point[1]}` : `${acc} ${command(point, i, a)}`, '');
    };

    this.historyPaths = {
      income: line(this.historyData.map((d, i) => getPoint(d.income, i))),
      expenses: line(this.historyData.map((d, i) => getPoint(d.expenses, i))),
      balance: line(this.historyData.map((d, i) => getPoint(d.balance, i))),
    };
  }

  private controlPoint(current: [number, number], previous: [number, number], next: [number, number], reverse?: boolean): [number, number] {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.2;
    const line = (p1: [number, number], p2: [number, number]) => ({ length: Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2)), angle: Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) });
    const angle = line(p, n).angle + (reverse ? Math.PI : 0);
    const length = line(p, n).length * smoothing;
    const x = current[0] + Math.cos(angle) * length;
    const y = current[1] + Math.sin(angle) * length;
    return [x, y];
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