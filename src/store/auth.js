import { create } from 'zustand';
import { $axInstance } from './api';

const authProfiles = create((set, get) => ({
    state_AUTH_PROFILE: null,
    loading: true,
    error: null,
    _fetchPromise: null,

    // setter
    set_AUTH_PROFILE: (state_AUTH_PROFILE) => set({ state_AUTH_PROFILE }),
    setError: (error) => set({ error }),
    act_INIT_AUTH: async () => {
        const inFlight = get()._fetchPromise;
        if (inFlight) return inFlight;

        const promise = (async () => {
            try {
                const resp = await $axInstance.post('/auth/refresh');
                set({ state_AUTH_PROFILE: resp.data, loading: false, _fetchPromise: null });
                return resp.data;
            } catch (error) {
                // gapapa, berarti belum login
                set({ state_AUTH_PROFILE: null, loading: false, _fetchPromise: null });
                return null;
            }
        })();

        set({ _fetchPromise: promise });
        return promise;
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
            await $axInstance.post('/auth/logout');
        } finally {
            set({ state_AUTH_PROFILE: null });
        }
    },
}));

export default authProfiles;