import { useState } from 'react';
import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function useTransactionsQuery() {
    const userId = authProfiles((s) => s.state_AUTH_PROFILE?.id)
    const [ curSelectedTrx, setCurSelectedTrx ] = useState([])

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

    const updateTrx = async (id, updatedTrx) => {
        await $axInstance.put('/sheets/trx', {id, ...updatedTrx})
        mutate()
    }

    const bulkUpdate = async (changes) => {
        if (curSelectedTrx.length === 0) throw new Error('Select at least one transaction');
        try {
            const res = await $axInstance.patch('/sheets/bulk', {
                ids: curSelectedTrx,
                changes,
            });
            setCurSelectedTrx([]);
            await mutate();
            return res.data;
        } catch (err) {
            throw new Error(err?.response?.data?.error || err?.message || 'Request failed');
        }
    };

    return {
        trx: data ?? [],
        onTrxLoad: isLoading,
        revalidating: isValidating,
        trxError,
        refetch: mutate,
        addTransaction,
        updateTrx,
        curSelectedTrx,
        setCurSelectedTrx,
        bulkUpdate,
    };
}