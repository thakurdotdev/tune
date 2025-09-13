'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/user';

interface UserState {
  user: User | null;
  selectedLanguages: string[];

  setUser: (user: User) => void;
  logout: () => void;
  setSelectedLanguages: (languages: string[]) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      selectedLanguages: ['hindi'],

      setUser: (user: User) => set({ user }),

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null });
      },

      setSelectedLanguages: (languages: string[]) => {
        set({ selectedLanguages: languages });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useUser = () => useUserStore((state) => state.user);
