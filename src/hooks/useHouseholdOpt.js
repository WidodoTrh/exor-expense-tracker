import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function useInviteMember() {
    const inviteMember = async ({ email, household_id }) => {
        const res = await $axInstance.post('/household/invite', { email, household_id });
        return res.data;
    };

    return { inviteMember };
    
}

export function useHouseholdMembersQuery() {
    const userId = authProfiles((s) => s.state_AUTH_PROFILE?.id);
    const fetcher = () =>
        $axInstance.get('/household/getlist').then((res) => res.data.members);

    const { data, error, isLoading, mutate } = useSWR(userId ? ['/household/getlist', userId] : null, fetcher);
    return { members: data ?? [], memberOnLoad: isLoading, membersError: error, refetch: mutate };
}