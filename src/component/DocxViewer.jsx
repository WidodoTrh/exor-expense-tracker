import { useEffect, useState } from 'react'
import mammoth from 'mammoth'
import { Box, CircularProgress, Typography } from '@mui/material'
import { $axPdf } from '../store/api' // reuse instance yang sama, base URL-nya kan sama

function DocxViewer({ encFileName }) {
    const [html, setHtml] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!encFileName) return
        let cancelled = false
        setLoading(true)
        setError(null)

        $axPdf.get(encFileName)
            .then(resp => resp.data.arrayBuffer())
            .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer }))
            .then(result => {
                if (cancelled) return
                setHtml(result.value)
            })
            .catch(err => {
                if (!cancelled) setError('Gagal memuat dokumen')
                console.error(err)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [encFileName])

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress size={28} /></Box>
    if (error) return <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>{error}</Box>

    return (
        <Box
            sx={{
                p: 3, bgcolor: '#fff', borderRadius: 1,
                '& img': { maxWidth: '100%' }, // guard biar gambar di dalem docx gak overflow
                '& table': { borderCollapse: 'collapse', width: '100%' },
                '& td, & th': { border: '1px solid #ddd', p: 1 },
            }}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    )
}

export default DocxViewer