import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function useTransactionsQuery() {
    const { state_AUTH_PROFILE } = authProfiles();
    const userId = state_AUTH_PROFILE?.id;

    const fetcher = () =>
        $axInstance
            .get('/sheets/getlist')
            .then((res) => res.data.transactions);

    const { data, error: trxError, isLoading, isValidating, mutate } = useSWR(
        userId ? ['/sheets/getlist', userId] : null,
        fetcher
    );

    const addTransaction = async (newTrx) => {
        await $axInstance.post('/sheets/trx', newTrx);
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