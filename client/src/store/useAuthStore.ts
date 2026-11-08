import { create } from 'zustand';

interface AuthState {
    user: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    checkAuth: (apiClient: any) => Promise<void>;
    login: (userData: any) => void;
    logout: (apiClient: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    checkAuth: async (apiClient) => {
        try {
            const res = await apiClient.get('/v1/auth/me');
            set({ user: res.data.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
    login: (userData) => set({ user: userData, isAuthenticated: true }),
    logout: async (apiClient) => {
        await apiClient.post('/v1/auth/logout');
        set({ user: null, isAuthenticated: false });
    },
}));