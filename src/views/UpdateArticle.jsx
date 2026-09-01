import { Container, TextField, Button, Menu, MenuItem, IconButton, Divider, InputAdornment, CardContent,CardActions,Card, Chip, Grid, Pagination, Dialog, DialogTitle, DialogContent,ToggleButtonGroup,ToggleButton } from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState, useMemo, useParams } from 'react'
import { useSnackbar } from 'notistack'
import elibraryArticlesHooks from '../hooks/useLibraryArticles.js'
import DocumentForm from '../component/DocumentForm'
import FullScreenLoading from '../component/FullScreenLoading'
import global from "../appcore/global.js"

function MyDocumentUpdate() {
    const loc = useLocation()
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()
    const articleData = loc.state?.article

    const { actLIBRARY_GET_ARTICLES_SINGLE, getLIBRARY_GET_ARTICLES_SINGLE, actLIBRARY_UPDATE_MY_DOC, actClearCurrDoc , mutLIBRARY_UPDATE_MY_DOC} = elibraryArticlesHooks()
    const [loadingDetail, setLoadingDetail] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [serveErrors, setServError] = useState(null)

    useEffect(() => {
        if (!articleData?.id) {
            enqueueSnackbar('Data artikel tidak ditemukan', { variant: 'error' })
            navigate('/mydocument')
            return
        }

        actLIBRARY_GET_ARTICLES_SINGLE(articleData.id)
            .catch((e) => {
                console.error(e)
                enqueueSnackbar('Gagal memuat data artikel', { variant: 'error' })
            })
            .finally(() => setLoadingDetail(false))

        return () => actClearCurrDoc?.()
    }, [])

    const handleUpdate = async (formData) => {
        try {
            setSubmitting(true)
            const resp = await actLIBRARY_UPDATE_MY_DOC({ payload: articleData, formData })
            enqueueSnackbar(`${resp?.data?.message}`, { variant: 'success' })
            mutLIBRARY_UPDATE_MY_DOC(resp?.data?.data) // hit mutate nya untuk replace item yg baru di update, jadi biar irit network aje sih.
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

    if (loadingDetail || !getLIBRARY_GET_ARTICLES_SINGLE) {
        return <FullScreenLoading open message="Loading document" />
    }

    const initialValues = {
        title: getLIBRARY_GET_ARTICLES_SINGLE?.title,
        content: getLIBRARY_GET_ARTICLES_SINGLE?.content,
        category_id: getLIBRARY_GET_ARTICLES_SINGLE?.categories?.id,
        status_id: getLIBRARY_GET_ARTICLES_SINGLE?.statuses?.id,
        visibility_id: getLIBRARY_GET_ARTICLES_SINGLE?.visibility?.id,
        effective_date: getLIBRARY_GET_ARTICLES_SINGLE?.effective_date,
        articles: getLIBRARY_GET_ARTICLES_SINGLE?.references ?? [],
        authorName: getLIBRARY_GET_ARTICLES_SINGLE?.author?.name,
        code: getLIBRARY_GET_ARTICLES_SINGLE?.code,
        files: getLIBRARY_GET_ARTICLES_SINGLE?.files?.[0]?.file_name ?? null,
        file_path: getLIBRARY_GET_ARTICLES_SINGLE?.files?.[0]?.file_path.split('/').pop() ?? null,
    }

    return (
        <DocumentForm mode="update" initialValues={initialValues} onSubmit={handleUpdate} submitting={submitting} serveErrors={serveErrors} />
    )
}
export default MyDocumentUpdate