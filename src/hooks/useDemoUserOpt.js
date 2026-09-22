import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function useDemoUserOpt() {
    const userId = authProfiles((s) => s.state_AUTH_PROFILE?.id)

    const postSeed = async () => {
        await $axInstance.post('/demo/seed');
    };

    return { 
        postSeed
    }
}