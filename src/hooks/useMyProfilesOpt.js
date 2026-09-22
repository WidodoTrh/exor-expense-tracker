import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function useMyProfileQuery() {
    const userId = authProfiles((s) => s.state_AUTH_PROFILE?.id);
    const fetcher = () =>
        $axInstance.get('/auth/profiles').then((res) => res.data.profiles);

    const { data, error, isLoading, mutate } = useSWR(userId ? ['/auth/profiles', userId] : null, fetcher);
    
    const createOwnHousehold = async (householdName) => {
        await $axInstance.post('household/getlist', {householdName})
        mutate()
    }

    const dropOwnHousehold = async (householdId) => {
        await $axInstance.delete('household/getlist', {
            data: {householdId}
        });
        mutate()
    }
    
    return {
        myProfile: data, 
        profileLoading: isLoading, 
        profileError: error,
        createOwnHousehold,
        dropOwnHousehold,
    };
}