import useSWR from 'swr';
import { $axInstance } from '../store/api';
import authProfiles from '../store/auth';

export function useCategoriesQuery() {
    const userId = authProfiles((s) => s.state_AUTH_PROFILE?.id);
    const fetcher = () => $axInstance.get('/master/categories').then((res) => res.data.categories);

    const { data, error, isLoading, mutate } = useSWR(userId ? ['/master/categories', userId] : null, fetcher, {
        revalidateOnFocus: false,
    });

    const addCategory = async (newCategory) => {
        const res = await $axInstance.post('/master/categories', newCategory);
        mutate();
        return res.data;
    };

    const dropCategory = async (id) => {
        const res = await $axInstance.delete('/master/categories',{params: {id}})
        mutate()
        return res.data
    }

    return {
        ListCategory: data ?? [],
        onCategoryLoad: isLoading,
        categoriesError: error,
        addCategory,
        dropCategory,
    };
}

export function usePaymentTypesQuery() {
    const userId = authProfiles((s) => s.state_AUTH_PROFILE?.id);
    const fetcher = () => $axInstance.get('/master/payment-types').then((res) => res.data.payment_type);

    const { data, error } = useSWR(userId ? ['/master/payment-types', userId] : null, fetcher, {
        revalidateOnFocus: false,
    });

    const addPaymentType = async (val) => {
        const res = await $axInstance.post('/master/payment-types', val);
        mutate();
        return res.data;
    };

    const dropPaymentType = async (id) => {
        const res = await $axInstance.delete('/master/payment-types',{params: {id}})
        mutate()
        return res.data
    }


    return { 
        dropPaymentType,
        addPaymentType,
        ListPaymentType: data ?? [], 
        paymentTypesError: error 
    };
}

export function useCashflowTypesQuery() {
    const fetcher = () => $axInstance.get('/master/cashflow-types').then((res) => res.data.cashflow_type);

    const { data, error } = useSWR('/master/cashflow-types', fetcher, {
        revalidateOnFocus: false,
    });

    return { cashflowTypes: data ?? [], cashflowTypesError: error };
}