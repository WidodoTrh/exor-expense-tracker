import { LIBRARY_BOOKMARK_ARTICLES_DEL, LIBRARY_BOOKMARK_ARTICLES, LIBRARY_CREATE_MY_DOC,LIBRARY_ARTICLES_ANALYZE } from './action/reqApi';
import authProfiles from './auth';
import { $axArticle } from './api';
import { create } from 'zustand';

const ensureProfile = async () => {
    let profile = authProfiles.getState().AUTH_PROFILE;
    if (!profile?.id) {
        profile = await authProfiles.getState().act_AUTH_PROFILE();
    }
    return profile;
};


const useLibraryArticles = create((set, get) => ({
    LIBRARY_GET_ARTICLES: [],
    LIBRARY_GET_MY_DOC: [],
    LIBRARY_GET_ARTICLES_SINGLE: [],
    LIBRARY_CREATE_MY_DOC: [],
    LIBRARY_BOOKMARK_ARTICLES:[],
    LIBRARY_BOOKMARK_ARTICLES_DEL:[],
    LIBRARY_UPDATE_MY_DOC: [],

    isLoad: false,
    error: null,

    // state
    [LIBRARY_CREATE_MY_DOC] : (LIBRARY_CREATE_MY_DOC) => set({LIBRARY_CREATE_MY_DOC}),
    [LIBRARY_BOOKMARK_ARTICLES] : (LIBRARY_BOOKMARK_ARTICLES) => set({LIBRARY_BOOKMARK_ARTICLES}),

    setPostAnal: (LIBRARY_ARTICLES_ANALYZE) => set({LIBRARY_ARTICLES_ANALYZE}),
    setError: (error) => set({error}),

    //  mut
    mut_LIBRARY_UPDATE_MY_DOC: (currItem) => set((state) => ({
        LIBRARY_GET_MY_DOC: state.LIBRARY_GET_MY_DOC.map((item) =>
            item.id === currItem.id ? { ...item, ...currItem } : item
        )
    })),

    mut_LIBRARY_GET_ARTICLES: (currItem) => set((state) => {
        const isPublic = currItem?.visibility?.id === 3 && currItem?.statuses?.id === 2;
        const exists = state.LIBRARY_GET_ARTICLES.some(item => item.id === currItem.id);
        let updated;

        if (isPublic) {
            if (exists) {
                updated = state.LIBRARY_GET_ARTICLES.map((item) =>
                    item.id === currItem.id ? { ...item, ...currItem } : item
                );
            } else {
                updated = [...state.LIBRARY_GET_ARTICLES, currItem];
            }
        } else {
            updated = state.LIBRARY_GET_ARTICLES.filter((item) => item.id !== currItem.id);
        }

        return { LIBRARY_GET_ARTICLES: updated };
    }),

    mut_LIBRARY_ADD_BULK: (newArticles) => set((state) => ({
        LIBRARY_GET_MY_DOC: [...newArticles, ...state.LIBRARY_GET_MY_DOC]
    })),

    // actions 
    act_LIBRARY_UPDATE_MY_DOC: async ({payload, formData}) => {
        return new Promise((resolve, reject) => {
            $axArticle.put(`/${payload.id}`, formData)
            .then(resp => {
                const updItem = resp?.data?.data
                get().mut_LIBRARY_GET_ARTICLES(updItem)
                resolve(resp)
            }).catch(err => reject(err.response))
        });
    },

    act_LIBRARY_GET_ARTICLES: async (payload = {}) => {
        set({isLoad: true, error: null})
        const profile = await ensureProfile();
        return new Promise((resolve, reject) => {
            const params = {
                visitor_id: profile?.id,
                ...(payload.v ? { visibility_id: payload.v } : {}),
                ...(payload.s ? { status_id: payload.s} : {}),
            };
            $axArticle.post('/getlist', null, { params })
                .then(resp => {
                    const articleMap = new Map();
                    resp.data.forEach(item => {
                        const existing = articleMap.get(item.id);
                        if (!existing || (item.bookmark && !existing.bookmark)) {
                            articleMap.set(item.id, item);
                        }
                    });

                    const uniqueArticles = Array.from(articleMap.values());
                    set({LIBRARY_GET_ARTICLES: uniqueArticles, isLoad: false})
                    resolve(resp);
                })
                .catch(err => {
                    set({LIBRARY_GET_ARTICLES: [], error:err.response, isLoad: false})
                    reject(err.response);
                });
        });
    },

    setBookmarkStatus: (articleId, status) => {
        set(state => ({
            LIBRARY_GET_ARTICLES: state.LIBRARY_GET_ARTICLES.map(a =>
                a.id === articleId ? { ...a, bookmark: status } : a
            )
        }));
    },

    [LIBRARY_BOOKMARK_ARTICLES]: async (formData)=>{
        return new Promise((resolve,reject)=>{
            $axArticle.post(`/bookmark`, formData).then(resp => {
                resolve(resp);
            }).catch(err => {
                reject(err);
            });
        });
    },

    [LIBRARY_BOOKMARK_ARTICLES_DEL]:async (article_id)=>{
        const profile = await ensureProfile();
        return new Promise((resolve,reject)=>{
            $axArticle.delete(`/bookmark/${article_id}`,{
                params: {
                    user_id: profile?.id,
                }
            }).then(resp => {
                resolve(resp);
            }).catch(err => {
                reject(err);
            });
        });
    },

    act_LIBRARY_CREATE_MY_DOC: async ({ payload, formData }) => {
        for (const key in payload) {
            if (payload[key] !== undefined && payload[key] !== null) {
                formData.append(key, payload[key]);
            }
        }
        return new Promise((resolve, reject) => {
            $axArticle.post('/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(resp => {
                resolve(resp);
            })
            .catch(err => {
                reject(err.response);
            });
        });
    },

    act_LIBRARY_CREATE_BULK: async ({ payload, formData }) => {
        for (const key in payload) {
            if (payload[key] !== undefined && payload[key] !== null) {
                formData.append(key, payload[key]);
            }
        }

        let resp;
        try {
            resp = await $axArticle.post('/createbulk', formData);
        } catch (err) {
            throw err.response;
        }

        try {
            const newDocs = resp.data.map(item => item.data);
            get().mut_LIBRARY_ADD_BULK(newDocs);
        } catch (err) {
            console.error('Gagal update state my doc:', err);
        }

        return resp;
    },


    [LIBRARY_ARTICLES_ANALYZE]: async (payload) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData()
            Object.entries(payload || {}).forEach(([key, value]) => {
                formData.append(key, value)
            })
            $axArticle.post('/analyze', formData).then(resp => {
                resolve(resp);
            }).catch(err => {
                reject(err);
            });
        })
    },

    act_LIBRARY_GET_MY_DOC :async ()=>{
        const profile = await ensureProfile();
        return new Promise((resolve,reject)=>{
            $axArticle.post('/getlist', null ,{
                params: {
                    visitor_id: profile?.id,
                    author_id: profile?.id,
                }
            }).then(resp => {
                const uniqueMyDoc = Array.from(
                    new Map(resp.data.map(item => [item.id, item])).values()
                )
                set({LIBRARY_GET_MY_DOC: uniqueMyDoc})
                resolve(resp);
            }).catch(err => {
                set({LIBRARY_GET_MY_DOC: []})
                reject(err.response);
            });
        });
    },

    act_LIBRARY_GET_ARTICLES_SINGLE :async (article_id)=>{
        return new Promise((resolve,reject)=>{
            $axArticle.get(`/${article_id}`,{
            }).then(resp => {
                set({LIBRARY_GET_ARTICLES_SINGLE: resp.data})
                resolve(resp);
            }).catch(err => {
                reject(err);
            });
        });
    },
    
    act_clearCurrDoc: () => {
        set({LIBRARY_GET_ARTICLES_SINGLE: []});
    },


}));

export default useLibraryArticles;
