// components/ImageViewer.jsx
import { useEffect, useState } from 'react'
import { Box, CircularProgress, IconButton } from '@mui/material'
import { $axPdf } from '../store/api'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'

function ImageViewer({ encFileName }) {
    const [imgUrl, setImgUrl] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [scale, setScale] = useState(1)

    useEffect(() => {
        if (!encFileName) return
        let cancelled = false
        let objectUrl = null
        setLoading(true)
        setError(null)

        $axPdf.get(encFileName)
            .then(resp => {
                if (cancelled) return
                objectUrl = URL.createObjectURL(resp.data)
                setImgUrl(objectUrl)
            })
            .catch(err => {
                if (!cancelled) setError('Gagal memuat gambar')
                console.error(err)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
            if (objectUrl) URL.revokeObjectURL(objectUrl) // penting, biar gak memory leak
        }
    }, [encFileName])

    const zoomIn = () => setScale(s => Math.min(3, s + 0.25))
    const zoomOut = () => setScale(s => Math.max(0.5, s - 0.25))

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress size={28} /></Box>
    if (error) return <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>{error}</Box>

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, position: 'sticky', top: 0, zIndex: 1 }}>
                <IconButton onClick={zoomOut} size="small"><ZoomOutIcon /></IconButton>
                <IconButton onClick={zoomIn} size="small"><ZoomInIcon /></IconButton>
            </Box>
           <Box
                sx={{
                    width: '100%',
                    height: '70vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                }}
            >
                <img
                    src={imgUrl}
                    alt="preview"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.15s',
                        display: 'block',
                    }}
                />
            </Box>
        </Box>
    )
}

export default ImageViewer