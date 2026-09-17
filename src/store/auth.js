import { supabase } from '../lib/supabaseClient'
import { create } from 'zustand';
import { $axInstance } from './api';

const authProfiles = create((set, get) => ({
    state_AUTH_PROFILE: null,
    loading: true,
    error: null,
    _fetchPromise: null,
    _listenerAttached: false,

    // setter
    set_AUTH_PROFILE: (state_AUTH_PROFILE) => set({ state_AUTH_PROFILE }),
    setError: (error) => set({ error }),

    act_INIT_AUTH: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        set({ state_AUTH_PROFILE: session?.user ?? null, loading: false });

        if (!get()._listenerAttached) {
            supabase.auth.onAuthStateChange((event, session) => {
                set({ state_AUTH_PROFILE: session?.user ?? null });

                if (event === 'PASSWORD_RECOVERY') {
                    window.location.href = '/reset-password';
                }
            });
            set({ _listenerAttached: true });
        }
    },

    act_LOGIN_WITH_GOOGLE: async (code) => {
        try {
            const resp = await $axInstance.post('/auth/google', { code });
            set({ state_AUTH_PROFILE: resp.data, error: null });
            return resp.data;
        } catch (error) {
            set({ error: error?.response?.data });
            throw error?.response?.data;
        }
    },

    act_LOGOUT: async () => {
        try {
            await supabase.auth.signOut();
        } finally {
            set({ state_AUTH_PROFILE: null });
        }
    },
}));

export default authProfiles;