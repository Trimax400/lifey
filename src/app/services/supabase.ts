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
        emailRedirectTo: 'http://localhost:4200/login'
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


  async getTransactions() {
    return await this.supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
  }

  async addTransaction(newTransaction: any) {
    return await this.supabase
      .from('transactions')
      .insert([newTransaction]);
  }
}