import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DescriptionIcon from '@mui/icons-material/Description'
import TableChartIcon from '@mui/icons-material/TableChart'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import ImageIcon from '@mui/icons-material/Image'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'

import { Box } from "@mui/material";

const FILE_TYPE_META = {
    pdf: { icon: PictureAsPdfIcon, color: '#D32F2F', label: 'PDF' },
    doc: { icon: DescriptionIcon, color: '#2B579A', label: 'DOC' },
    docx: { icon: DescriptionIcon, color: '#2B579A', label: 'DOCX' },
    xls: { icon: TableChartIcon, color: '#217346', label: 'XLS' },
    xlsx: { icon: TableChartIcon, color: '#217346', label: 'XLSX' },
    ppt: { icon: SlideshowIcon, color: '#D24726', label: 'PPT' },
    pptx: { icon: SlideshowIcon, color: '#D24726', label: 'PPTX' },
    png: { icon: ImageIcon, color: '#9C27B0', label: 'PNG' },
    jpg: { icon: ImageIcon, color: '#9C27B0', label: 'JPG' },
    jpeg: { icon: ImageIcon, color: '#9C27B0', label: 'JPEG' },
}

export function getFileTypeMeta(extension) {
    const key = extension?.toLowerCase().replace('.', '')
    return FILE_TYPE_META[key] || { color: '#757575', label: key?.toUpperCase() || '-' }
}


function FileTypeBadge({ extension, size = 64 }) {
    const key = extension?.toLowerCase().replace('.', '');
    const meta = FILE_TYPE_META[key] || { color: '#757575', label: key?.toUpperCase() || '-' };

    const foldSize = size * 0.28;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
            <svg width={size} height={size * 1.28} viewBox="0 0 100 128">
                {/* body dokumen */}
                <path
                    d={`M15,4
                        H${100 - foldSize * 1.0}
                        L96,${foldSize * 1.0 + 4}
                        V124
                        H15
                        Z`}
                    fill="#fff"
                    stroke={meta.color}
                    strokeWidth="3"
                    strokeLinejoin="round"
                />
                {/* lipatan pojok kanan atas */}
                <path
                    d={`M${100 - foldSize} 4
                        L96 ${foldSize + 4}
                        L${100 - foldSize} ${foldSize + 4}
                        Z`}
                    fill={meta.color}
                    opacity="0.25"
                />
                {/* pita label warna */}
                <rect
                    x="15"
                    y="82"
                    width="81"
                    height="30"
                    rx="3"
                    fill={meta.color}
                />
                <text
                    x="55.5"
                    y="102"
                    textAnchor="middle"
                    fontSize="17"
                    fontWeight="700"
                    fontFamily="Arial, sans-serif"
                    fill="#fff"
                >
                    {meta.label}
                </text>
            </svg>
        </Box>
    );
}

export default FileTypeBadge