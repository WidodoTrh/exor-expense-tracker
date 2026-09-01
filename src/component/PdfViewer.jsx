import { useEffect, useRef, useState, useCallback } from 'react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import { Box, IconButton, Typography, CircularProgress, Paper } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import { $axPdf } from '../store/api'

import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
GlobalWorkerOptions.workerSrc = PdfWorker

function PdfViewer({ encFileName }) {
    const canvasRef = useRef(null)
    const pdfDocRef = useRef(null)
    const renderTaskRef = useRef(null)
    const blobUrlRef = useRef(null) 

    const [numPages, setNumPages] = useState(0)
    const [pageNum, setPageNum] = useState(1)
    const [scale, setScale] = useState(1.2)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!encFileName) return
        let cancelled = false
        setLoading(true)
        setError(null)

        $axPdf.get(encFileName)
            .then(resp => resp.data.arrayBuffer())
            .then(arrayBuffer => {
                if (cancelled) return
                return getDocument({ data: arrayBuffer }).promise
            })
            .then(pdf => {
                if (cancelled || !pdf) return
                pdfDocRef.current = pdf
                setNumPages(pdf.numPages)
                setPageNum(1)
            })
            .catch(err => {
                if (!cancelled) setError('Gagal memuat dokumen PDF')
                console.error(err)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
            if (pdfDocRef.current && typeof pdfDocRef.current.destroy === 'function') {
                pdfDocRef.current.destroy()
            }
            pdfDocRef.current = null
        }
    }, [encFileName])

    const renderPage = useCallback(async () => {
        const pdf = pdfDocRef.current
        if (!pdf || !canvasRef.current) return

        // cancel render sebelumnya kalau masih jalan (misal user cepet ganti page)
        renderTaskRef.current?.cancel()

        const page = await pdf.getPage(pageNum)
        const viewport = page.getViewport({ scale })

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        canvas.width = viewport.width
        canvas.height = viewport.height

        const task = page.render({ canvasContext: context, viewport })
        renderTaskRef.current = task

        try {
            await task.promise
        } catch (err) {
            if (err?.name !== 'RenderingCancelledException') console.error(err)
        }
    }, [pageNum, scale])

    useEffect(() => {
        if (!loading && !error) renderPage()
    }, [loading, error, renderPage])

    const goPrev = () => setPageNum(p => Math.max(1, p - 1))
    const goNext = () => setPageNum(p => Math.min(numPages, p + 1))
    const zoomIn = () => setScale(s => Math.min(3, s + 0.2))
    const zoomOut = () => setScale(s => Math.max(0.4, s - 0.2))

    if (error) {
        return <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>{error}</Box>
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {/* toolbar */}
            <Paper
                elevation={1}
                sx={{
                    display: 'flex', alignItems: 'center', gap: 1, p: 1,
                    position: 'sticky', top: 0, zIndex: 1, bgcolor: 'background.paper',
                }}
            >
                <IconButton onClick={goPrev} disabled={pageNum <= 1} size="small">
                    <ChevronLeftIcon />
                </IconButton>
                <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'center' }}>
                    {loading ? '...' : `${pageNum} / ${numPages}`}
                </Typography>
                <IconButton onClick={goNext} disabled={pageNum >= numPages} size="small">
                    <ChevronRightIcon />
                </IconButton>

                <Box sx={{ width: 1, height: 24, bgcolor: 'divider', mx: 1 }} />

                <IconButton onClick={zoomOut} size="small"><ZoomOutIcon /></IconButton>
                <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center' }}>
                    {Math.round(scale * 100)}%
                </Typography>
                <IconButton onClick={zoomIn} size="small"><ZoomInIcon /></IconButton>
            </Paper>

            {/* canvas render area */}
            <Box sx={{ position: 'relative', minHeight: 400 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                        <CircularProgress size={28} />
                    </Box>
                )}
                <canvas
                    ref={canvasRef}
                    style={{
                        display: loading ? 'none' : 'block',
                        boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
                        maxWidth: '100%',
                    }}
                />
            </Box>
        </Box>
    )
}

export default PdfViewer