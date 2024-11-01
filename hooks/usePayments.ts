"use client";

import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Payment {
  id: string;
  memberId: string;
  member: {
    name: string;
    email: string;
    phone: string;
  };
  amount: number;
  type: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  description?: string;
  reminders?: {
    types: string[];
    days: number[];
  };
}

interface PaymentFilters {
  memberName?: string;
  status?: string;
  dueDate?: Date;
  type?: string;
}

interface PaymentStats {
  totalDue: number;
  overdue: number;
  paid: number;
  pending: number;
  overdueCount: number;
  paidCount: number;
  pendingCount: number;
  dueTrend: string;
  overdueTrend: string;
  paidTrend: string;
  pendingTrend: string;
}

interface PaymentsState {
  payments: Payment[];
  filteredPayments: Payment[];
  filters: PaymentFilters;
  stats: PaymentStats | null;
  isLoading: boolean;
  error: string | null;
  fetchPayments: () => Promise<void>;
  fetchPaymentStats: () => Promise<void>;
  createPayment: (data: any) => Promise<void>;
  updatePaymentStatus: (id: string, status: string) => Promise<void>;
  sendReminder: (id: string, type: 'email' | 'whatsapp') => Promise<void>;
  setFilter: (key: keyof PaymentFilters, value: any) => void;
  clearFilters: () => void;
  importPayments: (file: File) => Promise<void>;
  exportPayments: (filters: any) => Promise<void>;
}

export const usePayments = create<PaymentsState>((set, get) => ({
  payments: [],
  filteredPayments: [],
  filters: {},
  stats: null,
  isLoading: false,
  error: null,

  fetchPayments: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/api/payments');
      const payments = response.data.content || [];
      set({ 
        payments,
        filteredPayments: payments,
        isLoading: false 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch payments';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchPaymentStats: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/api/payments/stats');
      set({ stats: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch payment stats';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  createPayment: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/api/payments', data);
      set((state) => ({
        payments: [...state.payments, response.data],
        filteredPayments: [...state.filteredPayments, response.data],
        isLoading: false
      }));
      toast.success('Payment created successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create payment';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updatePaymentStatus: async (id, status) => {
    try {
      set({ isLoading: true, error: null });
      await api.patch(`/api/payments/${id}/status`, { status });
      
      set((state) => ({
        payments: state.payments.map(payment =>
          payment.id === id ? { ...payment, status } : payment
        ),
        filteredPayments: state.filteredPayments.map(payment =>
          payment.id === id ? { ...payment, status } : payment
        ),
        isLoading: false
      }));
      
      toast.success('Payment status updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update payment status';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  sendReminder: async (id, type) => {
    try {
      set({ isLoading: true, error: null });
      await api.post(`/api/reminders/${id}/${type}`);
      toast.success(`Reminder sent via ${type}`);
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to send ${type} reminder`;
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  importPayments: async (file) => {
    try {
      set({ isLoading: true, error: null });
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/api/payments/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await get().fetchPayments();
      toast.success('Payments imported successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to import payments';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  exportPayments: async (filters) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/api/payments/export', filters, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payments-${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      set({ isLoading: false });
      toast.success('Payments exported successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to export payments';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  setFilter: (key, value) => {
    set(state => {
      const newFilters = {
        ...state.filters,
        [key]: value === 'all' ? undefined : value
      };

      const filtered = state.payments.filter(payment => {
        const matchesName = !newFilters.memberName || 
          payment.member.name.toLowerCase().includes(newFilters.memberName.toLowerCase());
        
        const matchesStatus = !newFilters.status || 
          payment.status === newFilters.status;
        
        const matchesType = !newFilters.type || 
          payment.type === newFilters.type;
        
        const matchesDueDate = !newFilters.dueDate || 
          new Date(payment.dueDate).toDateString() === newFilters.dueDate.toDateString();

        return matchesName && matchesStatus && matchesType && matchesDueDate;
      });

      return {
        filters: newFilters,
        filteredPayments: filtered
      };
    });
  },

  clearFilters: () => {
    set(state => ({
      filters: {},
      filteredPayments: state.payments
    }));
  }
}));