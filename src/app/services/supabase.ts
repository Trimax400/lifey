import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;
  

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async signIn(email: string, pass: string) {
    return await this.supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });
  }

  async signUp(email: string, pass: string) {
    return await this.supabase.auth.signUp({
      email: email,
      password: pass,
    });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async resendConfirmation(email: string) {
    const { data, error } = await this.supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${environment.serverUrl}/login`
      }
    });
    return { data, error };
  }

  async resetPasswordForEmail(email: string, options: { redirectTo: string }) {
    return await this.supabase.auth.resetPasswordForEmail(email, options);
  }

  async updatePassword(newPassword: string) {
    return await this.supabase.auth.updateUser({
      password: newPassword
    });
  }


  async getTransactions(startDate?: string, endDate?: string) {
    let query = this.supabase.from('transactions').select('*');

    if (startDate && endDate) {
      query = query.or(`isRecurring.eq.true,and(date.gte.${startDate},date.lte.${endDate})`);
    }
    return await query.order('date', { ascending: false });
  }

  async getTransactionById(id: string | number) {
    return await this.supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
  }

  async addTransaction(newTransaction: any) {
    return await this.supabase
      .from('transactions')
      .insert([newTransaction]);
  }

  async updateTransaction(id: string | number, updatedTransaction: any) {
    return await this.supabase
      .from('transactions')
      .update(updatedTransaction)
      .eq('id', id);
  }

  async deleteTransaction(id: string | number) {
    return await this.supabase
      .from('transactions')
      .delete()
      .eq('id', id);
  }
}
