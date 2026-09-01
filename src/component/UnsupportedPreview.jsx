import { Box, Typography, Button } from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import { $axPdf } from '../store/api'

function UnsupportedPreview({ encFileName, fileExtension }) {
    const handleDownload = async () => {
        const resp = await $axPdf.get(encFileName)
        const url = URL.createObjectURL(resp.data)
        const a = document.createElement('a')
        a.href = url
        a.download = encFileName
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
                Preview untuk file {fileExtension?.toUpperCase()} belum didukung
            </Typography>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
                Download File
            </Button>
        </Box>
    )
}

export default UnsupportedPreview