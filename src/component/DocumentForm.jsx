import { useEffect, useState, useMemo, useRef } from 'react'
import { CircularProgress, Box, Container, Button, Menu, MenuItem, IconButton, Typography, Divider, InputAdornment, Grid, ToggleButtonGroup,ToggleButton,TextField,FormControl,Select,InputLabel,TextareaAutosize,Autocomplete,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,FormHelperText,TablePagination } from "@mui/material"

import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { useNavigate } from 'react-router-dom'
import {SingleFileInput} from "../component/ArticleUpload";
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import { $axPdf } from '../store/api';
import moment from 'moment'
import dayjs from 'dayjs'
import elibraryMasterHooks from "../hooks/useLibraryMaster"
import elibraryArticlesHooks from '../hooks/useLibraryArticles'
import DeleteIcon from '@mui/icons-material/Delete'
import authProfiles from '../store/auth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FullScreenLoading from '../component/FullScreenLoading'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = PdfWorker

function DocumentForm({ initialValues, onSubmit, submitting, mode = 'create', serveErrors = {} }) {
    const { getCategories:categories, getStatuses:statuses, getVisibility:vis } = elibraryMasterHooks({ getCategories: true, getStatuses: true, getVisibility: true })
    const { getPublicArticles:articlesGetlist } = elibraryArticlesHooks({ getPublicArticles: true })
    const myProfile = authProfiles((state) => state.state_AUTH_PROFILE)

    const normalizeInitRef = (rawArticles = []) => {
        return rawArticles.map((ref) => ({
            // `ref.id` adalah ID record reference. Untuk dibandingkan dengan
            // option Autocomplete, gunakan ID artikel yang direferensikan.
            id: ref.article?.id ?? ref.article_id ?? ref.id,
            code: ref.article_code,
            title: ref.article?.title,
        }))
    }

    const fileInputRef = useRef(null)
    const [errors, setErrors] = useState(null);
    const [title, setTitle] = useState(initialValues?.title ?? '')
    const [content, setContent] = useState(initialValues?.content ?? '')
    const [selectedCategory, setSelectedCategory] = useState(initialValues?.category_id ?? '')
    const [selectedStatuses, setSelectedStatuses] = useState(initialValues?.status_id ?? '')
    const [selectedVisibility, setSelectVs] = useState(initialValues?.visibility_id ?? '')
    const [selectedDate, setSelectedDate] = useState(initialValues?.effective_date ? new Date(initialValues?.effective_date) : null)
    const [selectedArticles, setSelectedArticles] = useState(() => normalizeInitRef(initialValues?.articles)) // normalizeRaw itu di kasih param nya lewat marih yak ...
    // File baru dari input saja. File existing cukup dipakai untuk preview/download.
    const [selectedFile, setSelectedFile] = useState(null)
    const [pdfPageThumbnails, setPdfPageThumbnails] = useState([])
    const [selectedThumbnailPage, setSelectedThumbnailPage] = useState(0)
    const [loadingPdfPages, setLoadingPdfPages] = useState(false)
    const [pdfPreviewError, setPdfPreviewError] = useState('')
    const [articleInputValue, setArticleInputValue] = useState('')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(5)

    const navigate = useNavigate()
    const backNavigate = () => {
        navigate('/mydocument')
    }

    const selectCatChange = (event) => {
        setSelectedCategory(event.target.value)
    }

    const selectStatChange = (event) => {
        setSelectedStatuses(event.target.value)
    }

    const selectVsChange = (event) => {
        setSelectVs(event.target.value)
    }

    const selectedArtChage = (event) => {
        setSelectedArticles(event.target.value)
    }

    // buat datatable
    const handleArticleSelect = (event, newValue) => {
        if (!newValue) return
        const alreadyExist = selectedArticles.some((item) => item.id === newValue.id)
        if (alreadyExist) return

        setSelectedArticles((prev) => [...prev, newValue])
    }

    const handleRemoveArticle = (id) => {
        setSelectedArticles((prev) => prev.filter((item) => item.id !== id))
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }


    useEffect(() => {
        let cancelled = false
        setErrors(serveErrors)

        const loadPdfPages = async () => {
            const isNewPdf = selectedFile instanceof File && selectedFile.name.toLowerCase().endsWith('.pdf')
            const existingFileName = initialValues?.files ?? ''
            const isExistingPdf = !selectedFile && existingFileName.toLowerCase().endsWith('.pdf') && initialValues?.file_path

            if (!isNewPdf && !isExistingPdf) {
                setPdfPageThumbnails([])
                setSelectedThumbnailPage(0)
                setPdfPreviewError('')
                return
            }

            try {
                setLoadingPdfPages(true)
                setPdfPreviewError('')
                setPdfPageThumbnails([])
                setSelectedThumbnailPage(0)
                const pdfData = isNewPdf
                    ? await selectedFile.arrayBuffer()
                    : (await $axPdf.get(`/${initialValues.file_path}`, { responseType: 'arraybuffer' })).data

                if (cancelled) return

                const pdf = await getDocument({ data: pdfData }).promise
                const thumbnails = []

                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
                    const page = await pdf.getPage(pageNumber)
                    const sourceViewport = page.getViewport({ scale: 1 })
                    const viewport = page.getViewport({ scale: 180 / sourceViewport.width })
                    const canvas = document.createElement('canvas')
                    canvas.width = Math.ceil(viewport.width)
                    canvas.height = Math.ceil(viewport.height)
                    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
                    thumbnails.push(canvas.toDataURL('image/jpeg', 0.8))
                }

                pdf.cleanup?.()
                if (!cancelled) setPdfPageThumbnails(thumbnails)
            } catch (error) {
                console.error('Gagal membuat preview PDF:', error)
                if (!cancelled) setPdfPreviewError('Preview halaman PDF gagal dimuat.')
            } finally {
                if (!cancelled) setLoadingPdfPages(false)
            }
        }
        loadPdfPages()
        return () => { cancelled = true }


    }, [serveErrors, selectedFile, initialValues?.file_path, initialValues?.files])

    const handleSubmit = () => {
        const formData = new FormData()
        if (selectedArticles.length > 0) {
            selectedArticles.forEach((a) => formData.append('reference_codes', a.code))
        }
        formData.append('author_id', myProfile?.id)
        formData.append('title', title)
        formData.append('content', content)
        formData.append('effective_date', selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : '')
        formData.append('category_id', selectedCategory)
        formData.append('visibility_id', selectedVisibility)
        formData.append('status_id', selectedStatuses)
        formData.append('thumbnail_file', selectedThumbnailPage)
        if (selectedFile instanceof File) formData.append('upload_files', selectedFile)

        onSubmit(formData) // <- kasih ke parent
    }

    return (
        <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, py: 4, px: 5, gap: 5 }}>
            <FullScreenLoading open={submitting} message={mode === 'create' ? 'Submitting Article' : 'Updating Article'} />
            {/* ... semua JSX field sama persis kaya sekarang, cuma pake state di atas ... */}
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>Create Article</h3>
                <Button variant="contained" onClick={backNavigate} startIcon={<ArrowBackIcon />}>Back</Button>
            </Box>
            <Grid container spacing={2} sx={{justifyContent:'center'}}>
                <Grid size={{xs: 12, md:8}} sx={{display: 'flex', flexDirection: 'column', marginTop:4, gap:2}}>
                    {mode === 'update' && (
                        <TextField fullWidth label="Article Code" value={initialValues.code ?? ''} disabled />
                    )}
                    <InputLabel id="author-name">Author Name</InputLabel>
                    <TextField fullWidth disabled value={myProfile?.name}></TextField>
                    <SingleFileInput ref={fileInputRef} onFileSelect={setSelectedFile} initFileName={initialValues?.files} />
                    {(loadingPdfPages || pdfPageThumbnails.length > 0 || pdfPreviewError) && (
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2">Select Thumbnail</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                page selected : {selectedThumbnailPage + 1}.
                            </Typography>
                            {loadingPdfPages && <Typography variant="body2">
                                    Loading PDF Pages...
                                    <CircularProgress size={20} />
                            </Typography>}
                            {pdfPreviewError && <Typography variant="body2" color="error">{pdfPreviewError}</Typography>}
                            {pdfPageThumbnails.length > 0 && (
                                <ToggleButtonGroup
                                    exclusive
                                    value={selectedThumbnailPage}
                                    onChange={(event, pageIndex) => pageIndex !== null && setSelectedThumbnailPage(pageIndex)}
                                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
                                >
                                    {pdfPageThumbnails.map((thumbnail, pageIndex) => (
                                        <ToggleButton key={pageIndex} value={pageIndex} sx={{ width: 130, p: 0.75, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Box component="img" src={thumbnail} alt={`Page ${pageIndex + 1}`} sx={{ width: '100%', height: 160, objectFit: 'contain', bgcolor: 'grey.100' }} />
                                            <Typography variant="caption">Page {pageIndex + 1}</Typography>
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            )}
                        </Paper>
                    )}
                    <TextField 
                        fullWidth 
                        label="Document Title" 
                        required 
                        onChange={(e) => setTitle(e.target.value)} 
                        value={title}
                        error={!!errors?.title}
                        helperText= {errors?.title || null}
                    />
                    <FormControl required error={!!errors?.category}>
                        <InputLabel id="select-category-label">Select Category</InputLabel>
                        <Select
                            labelId="select-category-label"
                            id="select-category"
                            value={selectedCategory}
                            label="Category"
                            onChange={selectCatChange}
                            MenuProps={{
                                slotProps: {
                                    paper: {
                                        sx: {
                                            maxHeight: 200,
                                        },
                                    },
                                },
                            }}
                        >
                            {categories?.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors?.category && (
                            <FormHelperText>
                                {errors.category}
                            </FormHelperText>
                        )}
                    </FormControl>
                    <FormControl required>
                        <InputLabel>Select Status</InputLabel>
                        <Select
                            labelId="select-statuses-label"
                            id="select-statuses"
                            value={selectedStatuses}
                            label="Select"
                            onChange={selectStatChange}
                        >
                            {statuses?.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <DatePicker
                        label="Document Date"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                            },
                        }}
                    />
                    <FormControl required>
                        <InputLabel>Select Visibility</InputLabel>
                        <Select
                            labelId="select-visibility-label"
                            id="select-visibility"
                            value={selectedVisibility}
                            label="Select"
                            onChange={selectVsChange}
                        >
                            {vis?.map((v) => (
                                <MenuItem key={v.id} value={v.id}>
                                    {v.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField 
                        slotProps={{
                            shrink: true,
                        }}
                        id="desc" 
                        label="Description" 
                        multiline minRows={4} 
                        onChange={(e) => setContent(e.target.value)} 
                        value={content}
                        error={!!errors?.title}
                        helperText= {errors?.title || null}
                    />

                    <Divider key="divider" sx={{marginY: 5}} />

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        <Autocomplete
                            sx={{ m: 1, maxWidth: 420 }}
                            options={articlesGetlist ?? []}
                            getOptionLabel={(option) => `${option.code} - ${option.title}`}
                            getOptionDisabled={(option) =>
                                mode === 'update' &&
                                selectedArticles.some((item) => item.id === option.id)
                            }
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            value={null}
                            inputValue={articleInputValue}
                            onInputChange={(event, newInputValue) => {
                                setArticleInputValue(newInputValue)
                            }}
                            onChange={(event, newValue) => {
                                handleArticleSelect(event, newValue)
                                setArticleInputValue('') // reset text abis milih
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Article" />
                            )}
                        />
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table>
                                <TableHead >
                                    <TableRow>
                                        <TableCell>Code</TableCell>
                                        <TableCell>Article Title</TableCell>
                                        <TableCell align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedArticles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center">
                                                No data available
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        selectedArticles.map((article) => (
                                            <TableRow key={article.id}>
                                                <TableCell>{article.code}</TableCell>
                                                <TableCell>{article.title}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleRemoveArticle(article.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            component="div"
                            count={selectedArticles.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            rowsPerPageOptions={[5, 10, 25]}
                        />
                    </Box>
                </Grid>
            </Grid>
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <Button onClick={handleSubmit} variant='contained' disabled={submitting}>
                    {submitting ? (mode === 'create' ? 'Submitting' : 'Updating') : (mode === 'create' ? 'Submit' : 'Update')}
                </Button>
            </Box>
        </Container>
    )
}

export default DocumentForm
