import { useNavigate } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import elibraryArticlesHooks from '../hooks/useLibraryArticles'
import DocumentForm from '../component/DocumentForm'
import global from "../appcore/global.js"


function MyDocumentCreate() {
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const { actLIBRARY_CREATE_MY_DOC } = elibraryArticlesHooks()
    const [submitting, setSubmitting] = useState(false)
    const [serveErrors, setServError] = useState(null)

    const handleCreate = async (formData) => {
        try {
            setSubmitting(true)
            const resp = await actLIBRARY_CREATE_MY_DOC({ formData })
            enqueueSnackbar(`${resp?.data}`, { variant: 'success' })
            navigate('/mydocument')
        } catch (error) {
            const parsedError = global.parseApiError(error)
            if (parsedError.type === 'validation') {
                setServError(parsedError.fieldErrors)
            }
            enqueueSnackbar(parsedError.message, {variant: 'error'})
        } finally {
            setSubmitting(false)
        }
    }

    return <DocumentForm mode="create" onSubmit={handleCreate} submitting={submitting} serveErrors={serveErrors} />
}

export default MyDocumentCreate