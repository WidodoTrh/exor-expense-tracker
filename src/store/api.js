import axios from 'axios';
import authProfiles from './auth';
import { supabase } from '../lib/supabaseClient';

const isDev = import.meta.env.VITE_APP_NODE_ENV === "DEV";
export const $axInstance = axios.create({
    baseURL: isDev ? import.meta.env.VITE_APP_OAUTH_API : import.meta.env.VITE_APP_OAUTH_API,
    headers:{
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    }
})

$axInstance.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

$axInstance.interceptors.response.use(
    (res) => res,
    async (err) => {
        if (err.response?.status === 401) {
            await supabase.auth.signOut({ scope: 'local' })
        }
        return Promise.reject(err)
    }
)

// let refreshPromise = null;
// $axInstance.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalRequest = error.config;
//         const isAuthEndpoint = originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/google');

//         if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
//         originalRequest._retry = true;

//         try {
//             if (!refreshPromise) {
//                 refreshPromise = $axInstance.post('/auth/refresh').finally(() => {
//                     refreshPromise = null;
//                 });
//             }
//             const refreshRes = await refreshPromise;
//             authProfiles.setState({ state_AUTH_PROFILE: refreshRes.data });
//             originalRequest.headers.Authorization = `Bearer ${refreshRes.data.access_token}`;
//             return $axInstance(originalRequest);
//         } catch (refreshError) {
//             authProfiles.setState({ state_AUTH_PROFILE: null });
//             window.location.href = '/login';
//             return Promise.reject(refreshError);
//         }
//         }

//         return Promise.reject(error);
//     }
// );