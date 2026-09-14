// hooks/useSummaryQuery.js
import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function useSummaryQuery({ month, year } = {}) {
    const { state_AUTH_PROFILE } = authProfiles();
    const accessToken = state_AUTH_PROFILE?.access_token;
    const spreadsheetId = state_AUTH_PROFILE?.spreadsheetId;

    const fetcher = () =>
        $axInstance
        .get('/sheets/summary', {params: { spreadsheetId, month, year }})
        .then((res) => res.data);

    const { data, summaryError, isLoading, mutate } = useSWR(
        accessToken && spreadsheetId ? ['/sheets/summary', spreadsheetId, month, year] : null,
        fetcher
    );

    return {
        summary: data ?? null,
        summaryLoading: isLoading,
        summaryError,
        refetch: mutate,
    };
}