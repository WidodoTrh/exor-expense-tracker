import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function usePaymentType() {
    const { state_AUTH_PROFILE } = authProfiles();
    const accessToken = state_AUTH_PROFILE?.access_token;
    const spreadsheetId = state_AUTH_PROFILE?.spreadsheetId;

    const fetcher = () =>
        $axInstance
        .get('/sheets/payment_type', {params: { spreadsheetId }})
        .then((res) => res.data.payment_type);

    const { data, newPTerror, isLoading, isValidating, mutate } = useSWR(
        accessToken && spreadsheetId ? ['/sheets/payment_type', spreadsheetId] : null,
        fetcher
    );

    const addPaymentType = async (newVal) => {
        await $axInstance.post('/sheets/payment_type', { ...newVal, spreadsheetId });
        mutate();
    };

    return {
        ListPaymentType: data ?? [],
        onPaymenttypeLoad: isLoading,
        revalidating: isValidating,
        newPTerror,
        refetch: mutate,
        addPaymentType,
    };
}