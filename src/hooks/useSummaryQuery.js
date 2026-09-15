// hooks/useSummaryQuery.js
import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function useSummaryQuery({ month, year } = {}) {
    const { state_AUTH_PROFILE } = authProfiles();
    const userId = state_AUTH_PROFILE?.id;

    const fetcher = () =>
        $axInstance
            .get('/sheets/summary', { params: { month, year } })
            .then((res) => res.data);

    const { data, error: summaryError, isLoading, mutate } = useSWR(
        userId && month && year ? ['/sheets/summary', userId, month, year] : null,
        fetcher
    );

    return {
        summary: data?.monthly ?? null,
        dailySummary: data?.daily ?? [],
        categorySummary: data?.by_category ?? [],
        summaryLoading: isLoading,
        summaryError,
        refetch: mutate,
    };
}