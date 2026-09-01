import { useEffect } from 'react';
import useLibraryMaster from '../store/master';

function elibraryMasterHooks(options = {
        getUsers: false, 
        getCategories: false, 
        getVisibility: false, 
        getStatuses: false}) {
            
    const getUsers = useLibraryMaster((state) => state.LIBRARY_GET_USER)
    const getCategories = useLibraryMaster((state) => state.LIBRARY_GET_CATEGORY)
    const getVisibility = useLibraryMaster((state) => state.LIBRARY_GET_VISIBILITY)
    const getStatuses = useLibraryMaster((state) => state.LIBRARY_GET_STATUSES)

    const error = useLibraryMaster((state) => state.error)

    const actLIBRARY_GET_USER = useLibraryMaster((state) => state.act_LIBRARY_GET_USER)
    const actLIBRARY_GET_CATEGORY = useLibraryMaster((state) => state.act_LIBRARY_GET_CATEGORY)
    const actLIBRARY_GET_VISIBILITY = useLibraryMaster((state) => state.act_LIBRARY_GET_VISIBILITY)
    const actLIBRARY_GET_STATUSES = useLibraryMaster((state) => state.act_LIBRARY_GET_STATUSES)
    const actLIBRARY_POST_CATEGORY = useLibraryMaster((state) => state.act_LIBRARY_POST_CATEGORY)
    const actLIBRARY_DEL_CATEGORY = useLibraryMaster((state) => state.act_LIBRARY_DEL_CATEGORY)

    useEffect(() => {
        if ( options.getUsers && getUsers.length === 0) actLIBRARY_GET_USER()
        if ( options.getCategories && getCategories.length === 0) actLIBRARY_GET_CATEGORY()
        if ( options.getVisibility && getVisibility.length === 0) actLIBRARY_GET_VISIBILITY()
        if ( options.getStatuses && getStatuses.length === 0) actLIBRARY_GET_STATUSES()
    }, [])

    return {
        getUsers, 
        getCategories, 
        getVisibility, 
        getStatuses,
        actLIBRARY_POST_CATEGORY,
        actLIBRARY_DEL_CATEGORY,
        error
    }
}

export default elibraryMasterHooks