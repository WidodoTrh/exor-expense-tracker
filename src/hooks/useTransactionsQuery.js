import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function useTransactionsQuery() {
    const { state_AUTH_PROFILE } = authProfiles();
    const accessToken = state_AUTH_PROFILE?.access_token;
    const spreadsheetId = state_AUTH_PROFILE?.spreadsheetId;

    const fetcher = () =>
        $axInstance
        .get('/sheets/trx', {params: { spreadsheetId }})
        .then((res) => res.data.transactions);

    const { data, trxError, isLoading, isValidating, mutate } = useSWR(
        accessToken && spreadsheetId ? ['/sheets/trx', spreadsheetId] : null,
        fetcher
    );

    const addTransaction = async (newTrx) => {
        await $axInstance.post('/sheets/trx', { ...newTrx, spreadsheetId });
        mutate();
    };

    return {
        trx: data ?? [],
        onTrxLoad: isLoading,
        revalidating: isValidating,
        trxError,
        refetch: mutate,
        addTransaction,
    };
}