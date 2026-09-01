
import { create } from 'zustand';
import { $axInstance } from './api';

const authProfiles = create((set, get) => ({
    state_AUTH_PROFILE : null,
    error: null,
    _fetchPromise: null,

    // setter
    set_AUTH_PROFILE : (state_AUTH_PROFILE) => set({state_AUTH_PROFILE}),
    setError: (error) => set({error}),

    act_AUTH_PROFILE: async () => {
        const inFlight = get()._fetchPromise;
        if (inFlight) return inFlight;
        
        const promise = (async () => {
            try {
                const toAccessId = import.meta.env.VITE_APP_ACCESS_ID;
                const toBranchId = import.meta.env.VITE_APP_BRANCH_ID;
                const toAppId = import.meta.env.VITE_APP_APP_ID;
                const toDeviceId = import.meta.env.VITE_APP_DEVICE_ID;

                const resp = await $axInstance.get(`${import.meta.env.VITE_APP_OAUTH_API}/myprofile?app_id=${toAppId}&branch_id=${toBranchId}&todevice_id=${toDeviceId}&toaccess_id=${toAccessId}&no_headers=1&version=2`,{responseType: 'text'});
                const d = JSON.parse(resp.data)
                set({ state_AUTH_PROFILE: d, _fetchPromise: null });
                return d;
            } catch (error) {
                set({ error: error?.response?.data, _fetchPromise: null });
                throw error?.response?.data;
            }
        })();

        set({ _fetchPromise: promise });
        return promise;
    },
}));

export default authProfiles;