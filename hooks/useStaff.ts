"use client";

import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  joinDate: string;
  photo: string;
  department: string;
  schedule: string;
  lastShift: string;
}

interface StaffState {
  staff: Staff[];
  currentStaff: Staff | null;
  isLoading: boolean;
  error: string | null;
  fetchStaff: () => Promise<void>;
  fetchStaffById: (id: string) => Promise<void>;
  createStaff: (data: Partial<Staff>) => Promise<void>;
  updateStaffStatus: (id: string, status: string) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useStaff = create<StaffState>((set) => ({
  staff: [],
  currentStaff: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchStaff: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get('/api/staff');
      set({ staff: response.data.content || [], isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch staff';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  fetchStaffById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/api/staff/${id}`);
      set({ currentStaff: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch staff details';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  createStaff: async (data: Partial<Staff>) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/api/staff', data);
      set((state) => ({
        staff: [...state.staff, response.data],
        isLoading: false
      }));
      toast.success('Staff member created successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create staff member';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  updateStaffStatus: async (id: string, status: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.patch(`/api/staff/${id}/status`, { status });
      
      set((state) => ({
        staff: state.staff.map((member) =>
          member.id === id ? { ...member, status } : member
        ),
        currentStaff: state.currentStaff?.id === id 
          ? { ...state.currentStaff, status }
          : state.currentStaff,
        isLoading: false
      }));
      
      toast.success('Staff status updated successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update staff status';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  },

  deleteStaff: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await api.delete(`/api/staff/${id}`);
      
      set((state) => ({
        staff: state.staff.filter((member) => member.id !== id),
        isLoading: false
      }));
      
      toast.success('Staff member deleted successfully');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete staff member';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
      throw error;
    }
  }
}));