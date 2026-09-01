import PdfViewer from './PdfViewer'
import DocxViewer from './DocxViewer'
import XlsxViewer from './XlsxViewer'
import ImageViewer from './ImageViewer'
import UnsupportedPreview from './UnsupportedPreview'

function DocumentViewer({ encFileName, fileExtension }) {
    const ext = fileExtension?.toLowerCase()

    switch (ext) {
        case 'pdf':
            return <PdfViewer encFileName={encFileName} />
        case 'docx':
            return <DocxViewer encFileName={encFileName} />
        case 'xlsx':
        case 'xls':
            return <XlsxViewer encFileName={encFileName} />
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'webp':
        case 'svg':
            return <ImageViewer encFileName={encFileName} />
        default:
            return <UnsupportedPreview encFileName={encFileName} fileExtension={ext} />
    }
}

export default DocumentViewer