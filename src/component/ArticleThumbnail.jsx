import { useState, useEffect, useRef } from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { $axPdf } from '../store/api';
import { Box, IconButton, Typography, CircularProgress, Paper } from '@mui/material';
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileTypeBadge, { getFileTypeMeta } from '../component/ExtentionIcon';

GlobalWorkerOptions.workerSrc = PdfWorker;

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
const PDF_EXTENSIONS = ['pdf'];

function PdfPageThumbnail({ fileId, pageIndex = 0 }) {
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        let renderTask = null;

        const cacheKey = `${fileId}-${pageIndex}`;

        async function renderPage() {
            try {
                setLoading(true);
                setError(false);

                // cek cache dulu
                const cached = thumbnailCache.get(cacheKey);
                if (cached) {
                    const img = new Image();
                    img.onload = () => {
                        if (cancelled) return;
                        const canvas = canvasRef.current;
                        if (!canvas) return;
                        canvas.width = img.width;
                        canvas.height = img.height;
                        canvas.getContext('2d').drawImage(img, 0, 0);
                        setLoading(false);
                    };
                    img.src = cached;
                    return;
                }

                const res = await $axPdf.get(`/${fileId}`, {
                    responseType: 'arraybuffer',
                });

                if (cancelled) return;

                const pdf = await getDocument({ data: res.data }).promise;
                const pageNumber = pageIndex + 1;
                const page = await pdf.getPage(pageNumber);

                const baseViewport = page.getViewport({ scale: 1 });
                const targetWidth = 300;
                const scale = targetWidth / baseViewport.width;
                const viewport = page.getViewport({ scale });

                const canvas = canvasRef.current;
                if (!canvas || cancelled) return;

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                renderTask = page.render({ canvasContext: canvas.getContext('2d'), viewport });
                await renderTask.promise;

                if (!cancelled) {
                    thumbnailCache.set(cacheKey, canvas.toDataURL());
                    setLoading(false);
                }
            } catch (err) {
                console.error('Gagal render thumbnail PDF:', err);
                if (!cancelled) {
                    setError(true);
                    setLoading(false);
                }
            }
        }

        renderPage();

        return () => {
            cancelled = true;
            if (renderTask) renderTask.cancel();
        };
    }, [fileId, pageIndex]);

    if (error) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <PictureAsPdfIcon sx={{ fontSize: 40, color: 'error.main' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            {loading && (
                <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={20} />
                </Box>
            )}
            <canvas
                ref={canvasRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: loading ? 'none' : 'block' }}
            />
        </Box>
    );
}
const thumbnailCache = new Map();
function ArticleThumbnail({ article }) {
    const file = article.files?.[0];
    const ext = file?.file_extension?.toLowerCase();
    const fileType = getFileTypeMeta(ext);
    // const FileIcon = fileType.icon;

    const boxSx = {
        width: '100%',
        height: 540,
        borderRadius: '8px 8px 0 0',
        overflow: 'hidden',
        bgcolor: 'action.hover',
        flexShrink: 0,
    };

    if (!file || !ext) {
        return (
            <Box sx={{ ...boxSx, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box
                    sx={{
                        px: 0.75, py: 0.15, borderRadius: 0.75,
                        bgcolor: fileType.color, color: '#fff',
                        fontSize: 10, fontWeight: 700, lineHeight: 1.4,
                        flexShrink: 0,
                    }}
                >
                    {fileType.label}
                </Box>
            </Box>
        );
    }

    if (IMAGE_EXTENSIONS.includes(ext)) {
        return (
            <Box sx={boxSx}>
                <Box
                    component="img"
                    src={file.file_path}
                    alt={article.title}
                    sx={{ width: '100%', height: '75vh', objectFit: 'cover' }}
                />
            </Box>
        );
    }

    if (PDF_EXTENSIONS.includes(ext)) {
        return (
            <Box sx={boxSx}>
                <PdfPageThumbnail fileId={file.file_path.split('/').pop()} pageIndex={file.file_page ?? 0} />
            </Box>
        );
    }

    return (
        <Box sx={{ ...boxSx, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileTypeBadge extension={ext} />
        </Box>
    );
}

export default ArticleThumbnail