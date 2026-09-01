import { LIBRARY_CREATE_BULK } from '../store/action/reqApi';
import { useEffect } from 'react';
import useLibraryArticles from '../store/library';

function elibraryArticlesHooks(options = {getPublicArticles: false, getPrivateArticles: false, getPublicArticlesDetail: false}, payload) {
    // buat nampung response ceunah 
    const isLoadingArticles = useLibraryArticles((state) => state.isLoad)

    // state nya ( bikin variable buat state penampung )
    const getPublicArticles = useLibraryArticles((state) => state.LIBRARY_GET_ARTICLES)
    const getPublicArticlesDetail = useLibraryArticles((state) => state.LIBRARY_GET_ARTICLES_SINGLE)
    const getPrivateArticles = useLibraryArticles((state) => state.LIBRARY_GET_MY_DOC)

    // const myDocumentUpdate = useLibraryArticles((state) => state.LIBRARY_GET_ARTICLES_SINGLE)
    const getLIBRARY_GET_ARTICLES_SINGLE = useLibraryArticles((state) => state.LIBRARY_GET_ARTICLES_SINGLE)
    const mutLIBRARY_UPDATE_MY_DOC = useLibraryArticles((state) => state.mut_LIBRARY_UPDATE_MY_DOC)

    // action nya ( bikin variabel buat action hit api nya )
    const actLIBRARY_GET_ARTICLES = useLibraryArticles((state) => state.act_LIBRARY_GET_ARTICLES)
    const actLIBRARY_GET_ARTICLES_SINGLE = useLibraryArticles((state) => state.act_LIBRARY_GET_ARTICLES_SINGLE)
    const actLIBRARY_GET_MY_DOC = useLibraryArticles((state) => state.act_LIBRARY_GET_MY_DOC)
    const actLIBRARY_ARTICLES_ANALYZE = useLibraryArticles((state) => state.LIBRARY_ARTICLES_ANALYZE)
    const actClearCurrDoc = useLibraryArticles((state) => state.act_clearCurrDoc)
    const setBookmarkStatus = useLibraryArticles((state) => state.setBookmarkStatus)
    
    const actLIBRARY_CREATE_BULK = useLibraryArticles((state) => state.act_LIBRARY_CREATE_BULK)
    const actLIBRARY_CREATE_MY_DOC = useLibraryArticles((state) => state.act_LIBRARY_CREATE_MY_DOC)
    const actLIBRARY_UPDATE_MY_DOC = useLibraryArticles((state) => state.act_LIBRARY_UPDATE_MY_DOC)
    const actLIBRARY_BOOKMARK_ARTICLES = useLibraryArticles((state) => state.LIBRARY_BOOKMARK_ARTICLES)
    const actLIBRARY_BOOKMARK_ARTICLES_DEL = useLibraryArticles((state) => state.LIBRARY_BOOKMARK_ARTICLES_DEL)
    
    const errArticleGetlist = useLibraryArticles((state) => state.error)

    useEffect(() => {
        if ( options.getPublicArticles && getPublicArticles.length === 0) actLIBRARY_GET_ARTICLES(payload)
        if ( options.getPrivateArticles && getPrivateArticles.length === 0) actLIBRARY_GET_MY_DOC()
        if ( options.getPublicArticlesDetail && getPublicArticlesDetail.length === 0) actLIBRARY_GET_ARTICLES_SINGLE()
    }, [])

    return {
        getPublicArticles,
        getPrivateArticles, 
        errArticleGetlist,
        // actLIBRARY_GET_MY_DOC,
        actLIBRARY_GET_ARTICLES_SINGLE,
        getPublicArticlesDetail, // baru nih
        actLIBRARY_ARTICLES_ANALYZE,
        isLoadingArticles,
        actLIBRARY_CREATE_BULK,
        actLIBRARY_CREATE_MY_DOC,
        actLIBRARY_UPDATE_MY_DOC,
        actLIBRARY_BOOKMARK_ARTICLES,
        actLIBRARY_BOOKMARK_ARTICLES_DEL,
        setBookmarkStatus,
        actClearCurrDoc,
        getLIBRARY_GET_ARTICLES_SINGLE,
        mutLIBRARY_UPDATE_MY_DOC,
    }
}

export default elibraryArticlesHooks