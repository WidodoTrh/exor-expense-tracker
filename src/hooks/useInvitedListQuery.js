import { useState } from 'react';
import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function useInvitedListQuery() {
    const spreadsheetId = authProfiles((s) => s.state_AUTH_PROFILE?.spreadsheetId);

    const [invitingUser, setInviting] = useState(false);
    const [inviteUserError, setError] = useState(null);
    const [revoking, setRevoking] = useState(false)


    const fetcher = () =>
        $axInstance
            .get('/sheets/invite', { params: { spreadsheetId } })
            .then((res) => res.data.invited);

    const { data, error, isLoading, mutate } = useSWR(
        spreadsheetId ? ['/sheets/invite', spreadsheetId] : null,
        fetcher
    );

    const inviteUser = async ({ inviteeEmail, role = 'writer' }) => {
        setInviting(true);
        setError(null);
        try {
            await $axInstance.post('/sheets/invite',{ spreadsheetId, inviteeEmail, role });
            mutate();
            return true;
        } catch (err) {
            const message = err?.response?.data?.error || err.message || 'Gagal mengundang user';
            setError(message);
            throw new Error(message);
        } finally {
            setInviting(false);
        }
    };

    const revokeInvite = async (email) => {
        setRevoking(true)
        try {
            await $axInstance.post('/sheets/invite-revoke', { spreadsheetId, email });
            mutate();
            return true
        } catch (error) {
            const message = err?.response?.data?.error || err.message || 'Failed to revoke';
            throw new Error(message);
        } finally {
            setRevoking(false)
        }
    };

    return {
        invitedList: data ?? [],
        invitedLoading: isLoading,
        invitedError: error,
        invitingUser,
        inviteUserError,
        revoking,
        inviteUser,
        revokeInvite,
        refetchInvited: mutate,
    };
}