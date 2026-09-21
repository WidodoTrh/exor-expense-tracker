import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

// Ambil pesan error dari API kalau ada, biar Alert di UI informatif
const toError = (err) =>
    new Error(err?.response?.data?.error || err?.message || 'Request failed');

export function useMySessionsQuery({ enabled = true } = {}) {
    const userId = authProfiles((s) => s.state_AUTH_PROFILE?.id);
    const fetcher = () =>
        $axInstance.get('/auth/sessions').then((res) => res.data.sessions);

    const { data, error, isLoading, isValidating, mutate } = useSWR(
        enabled && userId ? ['/auth/sessions', userId] : null,
        fetcher
    );

    const signOutOthers = async () => {
        try {
            await $axInstance.delete('/auth/sessions', { params: { scope: 'others' } });
        } catch (err) {
            throw toError(err);
        }
        await mutate();
    };

    const revokeSession = async (id) => {
        try {
            await $axInstance.delete('/auth/sessions', { params: { id } });
        } catch (err) {
            throw toError(err);
        }
        await mutate();
    };

    return {
        mySessions: data,
        sessionsLoading: isLoading,
        sessionsValidating: isValidating,
        sessionsError: error,
        refreshSessions: mutate,
        signOutOthers,
        revokeSession,
    };
}