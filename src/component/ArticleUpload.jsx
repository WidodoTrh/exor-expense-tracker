import global from "../appcore/global"
import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import {
Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, IconButton, Alert,
    List, ListItem, ListItemAvatar, ListItemText, Avatar
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import elibraryArticlesHooks from '../hooks/useLibraryArticles'
import elibraryMasterHooks from "../hooks/useLibraryMaster"
import authProfiles from '../store/auth';
import moment from 'moment'
import { useSnackbar } from 'notistack'

// ==== Config ====
const ALLOWED_EXTENSIONS = ['xlsx', 'docx', 'ppt', 'pptx', 'pdf', 'png', 'jpg', 'jpeg']
const MAX_FILE_SIZE_MB = 25

const FILE_ICONS = {
    pdf: global.ftpServe('/elibrary/Files/pdf-file-svgrepo-com.svg'),
    ppt: global.ftpServe('/elibrary/Files/ppt-document-svgrepo.svg'),
    pptx: global.ftpServe('/elibrary/Files/ppt-document-svgrepo.svg'),
    doc: global.ftpServe('/elibrary/Files/word-svgrepo-com.svg'),
    docx: global.ftpServe('/elibrary/Files/word-svgrepo-com.svg'),
    jpg: global.ftpServe('/elibrary/Files/jpg-svgrepo-com.svg'),
    jpeg: global.ftpServe('/elibrary/Files/jpg-svgrepo-com.svg'),
    png: global.ftpServe('/elibrary/Files/jpg-svgrepo-com.svg'),
    xlsx: global.ftpServe('/elibrary/Icon/xls-svgrepo.svg'),
}
const DEFAULT_ICON = global.ftpServe('/elibrary/Files/default-file.svg')

const getFileExtension = (filename) => {
    return filename.split('.').pop()?.toLowerCase() || ''
}

const getFileIcon = (filename) => {
    const ext = getFileExtension(filename)
    return FILE_ICONS[ext] || DEFAULT_ICON
}

const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FileUploadDialog({ open, onClose, onUploadSuccess }) {
    const { enqueueSnackbar } = useSnackbar()
    // const { AUTH_PROFILE } = authProfiles.getState()
    const myProfile = authProfiles((state) => state.state_AUTH_PROFILE)
    const { actLIBRARY_CREATE_BULK } = elibraryArticlesHooks({ getPublicArticles: false, getPrivateArticles: false })
    const { getCategories:categories, getVisibility:visibility, getStatuses:stat } = elibraryMasterHooks({ getCategories: true, getStatuses: true, getVisibility: true })
    const [files, setFiles] = useState([])
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const inputRef = useRef(null)

    const validateFile = (file) => {
        const ext = getFileExtension(file.name)

        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return `File "${file.name}" tidak didukung. Format yang diizinkan: ${ALLOWED_EXTENSIONS.join(', ')}`
        }

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            return `File "${file.name}" melebihi ukuran maksimal ${MAX_FILE_SIZE_MB}MB`
        }

        return null
    }

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files || [])
        setError('')

        const validFiles = []
        const errors = []

        selectedFiles.forEach((file) => {
            const validationError = validateFile(file)
            if (validationError) {
                errors.push(validationError)
            } else {
                validFiles.push(file)
            }
        })

        if (errors.length > 0) {
            setError(errors.join(' | '))
        }

        if (validFiles.length > 0) {
            setFiles((prev) => [...prev, ...validFiles])
        }

        // reset input value biar bisa select file yang sama lagi kalau perlu
        if (inputRef.current) inputRef.current.value = ''
    }

    const handleRemoveFile = (indexToRemove) => {
        setFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
    }

    const handleClose = () => {
        if (isSubmitting) return
        setFiles([])
        setError('')
        onClose()
    }

    const handleSubmit = async () => {
        if (files.length === 0) {
            setError('Pilih minimal 1 file untuk diupload')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            const formData = new FormData()
            files.forEach((file) => {
                formData.append('upload_files', file) 
            })

            const ctDefaultVal = categories?.find(ct => ct.name === 'File New Upload');
            const vStat = stat?.find(v => v.name === 'draft');
            const vVisibility = visibility?.find(vs => vs.name === 'Private')
            const payload = {
                effective_date: moment().format('YYYY-MM-DD'),
                author_id: myProfile.id,
                category_id: ctDefaultVal.id,
                status_id: vStat.id,
                visibility_id: vVisibility.id,
                thumbnail_file: 0,
            };

            const response = await actLIBRARY_CREATE_BULK({payload,formData})
            enqueueSnackbar(`${response?.data?.length} file berhasil diupload`, { variant: 'success' })
            onUploadSuccess?.(response.data)
            setFiles([])
            onClose()
        } catch (err) {
            enqueueSnackbar(`gagal upload`, { variant: 'error' })
            console.error('Upload error:', err)
            setError('Gagal mengupload file. Silakan coba lagi.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Upload File
                <IconButton onClick={handleClose} size="small" disabled={isSubmitting}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                    </Alert>
                )}

                <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{ py: 1.5, mb: 2, borderStyle: 'dashed' }}
                    disabled={isSubmitting}
                >
                    Pilih File
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        hidden
                        accept=".xlsx,.docx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                    />
                </Button>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    Format didukung: XLSX, DOCX, PPT, PDF, PNG, JPG, JPEG (maks {MAX_FILE_SIZE_MB}MB per file)
                </Typography>

                {files.length > 0 && (
                    <List dense>
                        {files.map((file, index) => (
                            <ListItem
                                key={`${file.name}-${index}`}
                                secondaryAction={
                                    <IconButton
                                        edge="end"
                                        size="small"
                                        onClick={() => handleRemoveFile(index)}
                                        disabled={isSubmitting}
                                    >
                                        <DeleteIcon fontSize="small" color="error" />
                                    </IconButton>
                                }
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    mb: 1,
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        src={getFileIcon(file.name)}
                                        variant="rounded"
                                        sx={{ bgcolor: 'transparent' }}
                                    />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={file.name}
                                    secondary={formatFileSize(file.size)}
                                    slotProps={{primary: { noWrap: true, variant: 'body2' }}}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}

                {files.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 3, color: 'text.disabled' }}>
                        <Typography variant="body2">Belum ada file dipilih</Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} disabled={isSubmitting}>
                    Batal
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isSubmitting || files.length === 0}
                >
                    {isSubmitting ? 'Mengupload...' : `Upload (${files.length})`}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const SingleFileInput = forwardRef(({ onFileSelect, initFileName }, ref) => {
    const [file, setFile] = useState(null)
    const [existingFileName, setExistingFileName] = useState(initFileName ?? null)
    const [error, setError] = useState('')
    const inputRef = useRef(null)

    useEffect(() => {
        if (initFileName) {
            setExistingFileName(initFileName)
        }
    }, [initFileName])

    const getFileExtension = (filename) => filename.split('.').pop()?.toLowerCase() || ''

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        setError('')
        const ext = getFileExtension(selectedFile.name)

        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            setError(`Format tidak didukung. Diizinkan: ${ALLOWED_EXTENSIONS.join(', ')}`)
            if (inputRef.current) inputRef.current.value = ''
            return
        }

        if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setError(`Ukuran file melebihi ${MAX_FILE_SIZE_MB}MB`)
            if (inputRef.current) inputRef.current.value = ''
            return
        }

        setFile(selectedFile)
        setExistingFileName(null)
        onFileSelect?.(selectedFile)
    }

    const handleRemove = () => {
        setFile(null)
        setExistingFileName(null)
        setError('')
        if (inputRef.current) inputRef.current.value = ''
        onFileSelect?.(null)
    }

    // expose handleRemove ke parent lewat ref
    useImperativeHandle(ref, () => ({
        reset: handleRemove,
    }))

    const displayName = file ? file.name : existingFileName

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                    Choose File
                    <input
                        ref={inputRef}
                        type="file"
                        hidden
                        accept=".xlsx,.docx,.ppt,.pptx,.pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                    />
                </Button>

                <Typography variant="body2" color={displayName ? 'text.primary' : 'text.disabled'} noWrap sx={{ flex: 1 }}>
                    {displayName ?? 'Belum ada file dipilih'}
                </Typography>

                {displayName && (
                    <IconButton size="small" onClick={handleRemove}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )}
            </Box>

            {error && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                    {error}
                </Typography>
            )}
        </Box>
    )
})

export {SingleFileInput, FileUploadDialog}