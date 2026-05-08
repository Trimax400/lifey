import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../services/supabase';
import { Transaction } from '../../../models/transaction.model';
import { RecurrenceService } from '../../../services/recurrence';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transactions.html'
})
export class Transactions implements OnInit {
  private supabaseService = inject(SupabaseService);
  private recurrenceService = inject(RecurrenceService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  transactions = signal<Transaction[]>([]);
  isLoading = signal<boolean>(true);
  
  viewMode = signal<'week' | 'month' | 'year'>('month');
  currentDate = signal<Date>(new Date());
  periodLabel = signal<string>('');
  filterType = signal<'all' | 'recurring' | 'one-time'>('all');

  async ngOnInit() {
    await this.loadTransactions();
  }

  async loadTransactions() {
    this.isLoading.set(true);
    try {
      const { start, end, label } = this.getPeriodDates();
      this.periodLabel.set(label);
      
      const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
      const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

      const { data, error } = await this.supabaseService.getTransactions(startStr, endStr);
      if (error) throw error;
      
      if (data) {
        const expandedData = this.recurrenceService.expandTransactions(data as Transaction[], end);
        
        let filteredData = expandedData.filter(t => {
          const dateStr = typeof t.date === 'string' ? t.date : t.date.toISOString();
          const [y, m, d] = dateStr.substring(0, 10).split('-').map(Number);
          const tDate = new Date(y, m - 1, d, 12, 0, 0);
          return tDate >= start && tDate <= end;
        });

        const filter = this.filterType();
        if (filter === 'recurring') {
          filteredData = filteredData.filter(t => t.isRecurring);
        } else if (filter === 'one-time') {
          filteredData = filteredData.filter(t => !t.isRecurring);
        }

        this.transactions.set(filteredData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
    } finally {
      this.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  getPeriodDates() {
    const d = new Date(this.currentDate());
    const mode = this.viewMode();
    const y = d.getFullYear();
    const m = d.getMonth();
    let start: Date, end: Date, label: string;

    if (mode === 'month') {
      start = new Date(y, m, 1, 0, 0, 0);
      end = new Date(y, m + 1, 0, 23, 59, 59);
      label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (mode === 'year') {
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
    const current = new Date(this.currentDate());
    const mode = this.viewMode();
    if (mode === 'month') current.setMonth(current.getMonth() - 1);
    else if (mode === 'year') current.setFullYear(current.getFullYear() - 1);
    else current.setDate(current.getDate() - 7);
    this.currentDate.set(current);
    this.loadTransactions();
  }

  nextPeriod() {
    const current = new Date(this.currentDate());
    const mode = this.viewMode();
    if (mode === 'month') current.setMonth(current.getMonth() + 1);
    else if (mode === 'year') current.setFullYear(current.getFullYear() + 1);
    else current.setDate(current.getDate() + 7);
    this.currentDate.set(current);
    this.loadTransactions();
  }

  setViewMode(mode: string) {
    this.viewMode.set(mode as 'week' | 'month' | 'year');
    this.currentDate.set(new Date());
    this.loadTransactions();
  }
  
  setFilterType(type: string) {
    this.filterType.set(type as 'all' | 'recurring' | 'one-time');
    this.loadTransactions();
  }

  async deleteTransaction(id: string) {
    console.log("id :", id);
    const realId = id.split('-recur-')[0];
    console.log("DeleteTransaction : ", realId);
    if (confirm('Are you sure you want to delete this transaction? (If this is a recurring transaction, it will be deleted completely)')) {
      const { error } = await this.supabaseService.deleteTransaction(realId);
      if (!error) {
        this.loadTransactions();
      }
      else {
        console.log(error);
      }
    }
  }

  editTransaction(id: string) {
    const realId = id.split('-recur-')[0];
    this.router.navigate(['/edit-transaction', realId]);
  }
}
