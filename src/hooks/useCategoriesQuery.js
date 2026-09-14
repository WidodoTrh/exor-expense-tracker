import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function useCategoriesQuery() {
    const { state_AUTH_PROFILE } = authProfiles();
    const accessToken = state_AUTH_PROFILE?.access_token;
    const spreadsheetId = state_AUTH_PROFILE?.spreadsheetId;

    const fetcher = () =>
        $axInstance
        .get('/sheets/categories', {params: { spreadsheetId }})
        .then((res) => res.data.categories);

    const { data, newCatError, isLoading, isValidating, mutate } = useSWR(
        accessToken && spreadsheetId ? ['/sheets/categories', spreadsheetId] : null,
        fetcher
    );

    const addCategories = async (newCat) => {
        await $axInstance.post('/sheets/categories', { ...newCat, spreadsheetId });
        mutate();
    };

    return {
        ListCategory: data ?? [],
        onCategoryLoad: isLoading,
        revalidating: isValidating,
        newCatError,
        refetch: mutate,
        addCategories,
    };
}