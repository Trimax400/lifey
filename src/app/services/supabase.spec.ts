import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { SupabaseService } from './supabase';

describe('SupabaseService', () => {
  let service: SupabaseService;

  const mockQuery = {
    select: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [SupabaseService]
    });
    service = TestBed.inject(SupabaseService);
  });

  beforeEach(() => {
    vi.clearAllMocks();

    service.supabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
        resend: vi.fn().mockResolvedValue({ data: {}, error: null }),
        resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
        updateUser: vi.fn().mockResolvedValue({ error: null })
      },
      from: vi.fn().mockReturnValue(mockQuery)
    } as any;
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('Authentication Methods', () => {
    it('should call auth.signInWithPassword', async () => {
      await service.signIn('test@email.com', 'password123');
      expect(service.supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@email.com',
        password: 'password123'
      });
    });

    it('should call auth.signUp', async () => {
      await service.signUp('test@email.com', 'password123');
      expect(service.supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@email.com',
        password: 'password123'
      });
    });

    it('should call auth.signOut', async () => {
      await service.signOut();
      expect(service.supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should call auth.resetPasswordForEmail with options', async () => {
      await service.resetPasswordForEmail('test@email.com', { redirectTo: 'url' });
      expect(service.supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@email.com', { redirectTo: 'url' }
      );
    });

    it('should call auth.updateUser for password update', async () => {
      await service.updatePassword('newPassword');
      expect(service.supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword'
      });
    });
  });

  describe('Database Methods (Transactions)', () => {
    it('should call getTransactions without dates', async () => {
      await service.getTransactions();
      expect(service.supabase.from).toHaveBeenCalledWith('transactions');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.or).not.toHaveBeenCalled();
      expect(mockQuery.order).toHaveBeenCalledWith('date', { ascending: false });
    });

    it('should call getTransactions with date filtering', async () => {
      await service.getTransactions('2024-01-01', '2024-01-31');
      expect(mockQuery.or).toHaveBeenCalledWith(
        'isRecurring.eq.true,and(date.gte.2024-01-01,date.lte.2024-01-31)'
      );
      expect(mockQuery.order).toHaveBeenCalledWith('date', { ascending: false });
    });

    it('should call getTransactionById', async () => {
      await service.getTransactionById('123');
      expect(service.supabase.from).toHaveBeenCalledWith('transactions');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '123');
      expect(mockQuery.single).toHaveBeenCalled();
    });

    it('should call addTransaction', async () => {
      const mockTx = { amount: 100, label: 'Test' };
      await service.addTransaction(mockTx);
      expect(service.supabase.from).toHaveBeenCalledWith('transactions');
      expect(mockQuery.insert).toHaveBeenCalledWith([mockTx]);
    });

    it('should call updateTransaction', async () => {
      mockQuery.eq.mockResolvedValueOnce({ error: null });
      
      const mockUpdates = { amount: 200 };
      await service.updateTransaction('123', mockUpdates);
      
      expect(service.supabase.from).toHaveBeenCalledWith('transactions');
      expect(mockQuery.update).toHaveBeenCalledWith(mockUpdates);
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '123');
    });

    it('should call deleteTransaction', async () => {
      mockQuery.eq.mockResolvedValueOnce({ error: null });

      await service.deleteTransaction('123');
      
      expect(service.supabase.from).toHaveBeenCalledWith('transactions');
      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '123');
    });
  });
});
