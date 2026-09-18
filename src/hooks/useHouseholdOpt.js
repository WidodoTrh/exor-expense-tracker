import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function useHouseholdMembersQuery() {
    const userId = authProfiles((s) => s.state_AUTH_PROFILE?.id)
    const fetcher = () =>
        $axInstance.get('/household/getlist').then((res) => res.data.members);

    const { data, error, isLoading, mutate } = useSWR(userId ? ['/household/getlist', userId] : null, fetcher);

    const inviteMember = async ({ email, household_id }) => {
        await $axInstance.post('/household/invite', { email, household_id });
        mutate()
    };

    const dropMember = async ({ user_id, household_id }) => {
        await $axInstance.delete('/household/invite', { data: { user_id, household_id } });
        mutate();
    };

    return { 
        members: data ?? [], 
        memberOnLoad: isLoading, 
        membersError: error, 
        inviteMember,
        dropMember,
        refetch: mutate 
    };    
}