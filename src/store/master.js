import { LIBRARY_GET_USER, LIBRARY_GET_CATEGORY, LIBRARY_GET_VISIBILITY, LIBRARY_GET_STATUSES } from './action/reqApi';
import { $axios } from './api';
import { create } from 'zustand';

const useLibraryMaster = create((set, get) => ({
    LIBRARY_GET_USER: [],
    LIBRARY_GET_CATEGORY: [],
    LIBRARY_GET_VISIBILITY: [],
    LIBRARY_GET_STATUSES: [],
    error: null,

    // state
    setUser : (LIBRARY_GET_USER) => set({LIBRARY_GET_USER}),
    setCategories: (LIBRARY_GET_CATEGORY) => set({LIBRARY_GET_CATEGORY}),
    setVisibility: (LIBRARY_GET_VISIBILITY) => set({LIBRARY_GET_VISIBILITY}),
    setStatus: (LIBRARY_GET_STATUSES) => set({LIBRARY_GET_STATUSES}),

    setError: (error) => set({error}),

    act_LIBRARY_GET_STATUSES: async() => {
        try {
            const res = await $axios.get('/statuses');
            set({LIBRARY_GET_STATUSES: res.data})
        } catch (error) {
            console.error(error)
            set({error: error.message})
        }
    },

    act_LIBRARY_GET_VISIBILITY: async() => {
        try {
            const res = await $axios.get('/visibilities');
            set({LIBRARY_GET_VISIBILITY: res.data})
        } catch (error) {
            console.error(error)
            set({error: error.message})
        }
    },

    act_LIBRARY_GET_USER: async() => {
        try {
            const res = await $axios.get('/users');
            set({LIBRARY_GET_USER: res.data})
        } catch (error) {
            console.error(error.response);
            set({error: error.message})
        }
    },

    act_LIBRARY_GET_CATEGORY: async() => {
        try {
            const res = await $axios.get('/categories');
            set({LIBRARY_GET_CATEGORY: res.data})
        } catch (error) {
            console.error(error.response);
            set({error: error.message})
        }
    },

    act_LIBRARY_POST_CATEGORY: async(formData) => {
        return new Promise((resolve, reject) => {
            $axios.post('/categories',formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            .then(resp => {
                resolve(resp);
                set((state) => ({
                    LIBRARY_GET_CATEGORY: [...state.LIBRARY_GET_CATEGORY, resp.data.data]
                }))
            })
            .catch(err => {
                reject(err.response);
                throw err
            });
        });
    },

    act_LIBRARY_DEL_CATEGORY: async(id) => {
        return new Promise((resolve, reject) => {
            $axios.delete(`/categories/${id}`)
            .then(resp => {
                resolve(resp);
                set((state) => ({
                    LIBRARY_GET_CATEGORY: state.LIBRARY_GET_CATEGORY.filter((c) => c.id !== id)
                }))
            })
            .catch(err => {
                reject(err.response);
                throw err
            });
        });
    },

}));

export default useLibraryMaster;