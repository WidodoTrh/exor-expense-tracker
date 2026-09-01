import axios from 'axios';

const isDev = import.meta.env.VITE_APP_NODE_ENV === "LOCAL";
const $axInstance = axios.create({
    headers:{
        'X-Client-Id': import.meta.env.VITE_APP_CLIENT_ID,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
})

// files-api-v2
const $axPdf = axios.create({
    baseURL: isDev
    ? '/getarticles-v2/files'
    : `${import.meta.env.VITE_APP_API_ARTICLE}/files`,
    responseType: 'blob',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client': import.meta.env.VITE_APP_CLIENT_ID,
        'Accept': 'application/json',
    },
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
})

const $axios = axios.create({
    baseURL: isDev
    ? '/getmaster-v2/'
    : `${import.meta.env.VITE_APP_API_MASTER}`,
    headers: {
        'X-Client': import.meta.env.VITE_APP_CLIENT_ID,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
});

const $axArticle = axios.create({
    baseURL: isDev ?
    '/getarticles-v2'
    : `${import.meta.env.VITE_APP_API_ARTICLE}`,
    headers: {
        'X-Client': import.meta.env.VUE_APP_CLIENT_ID,
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN'
})


export {$axios, $axArticle, $axInstance, $axPdf};