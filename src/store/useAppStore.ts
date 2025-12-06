import { create } from 'zustand';

export type Role = 'Admin' | 'M1' | 'Staff';

interface User {
    name: string;
    role: Role;
    avatar: string;
}

interface AppState {
    currentUser: User;
    setCurrentUser: (user: User) => void;
    switchRole: (role: Role) => void;
}

export const useAppStore = create<AppState>((set) => ({
    currentUser: {
        name: 'Demo User',
        role: 'Admin', // Default to Admin for demo
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    },
    setCurrentUser: (user) => set({ currentUser: user }),
    switchRole: (role) =>
        set((state) => ({
            currentUser: { ...state.currentUser, role },
        })),
}));
