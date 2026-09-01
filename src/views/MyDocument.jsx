import { Box, Container, Button, Menu, MenuItem, IconButton, Typography, Divider, InputAdornment, CardContent,CardActions,Card, Chip, Grid, Pagination, Dialog, DialogTitle, DialogContent,ToggleButtonGroup,ToggleButton } from "@mui/material"
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {FileUploadDialog} from "../component/ArticleUpload";
import global from "../appcore/global"
import ArticleThumbnail from '../component/ArticleThumbnail'
import ArticleCardSkeleton from '../component/ArticleCardSkeleton'
import moment from "moment";
import VisibilityIcon from '@mui/icons-material/Visibility'
import PersonIcon from '@mui/icons-material/Person'
import useArticleSearch from '../hooks/useArticleSearch'
import elibraryArticlesHooks from '../hooks/useLibraryArticles'
import ArticleSearchBar from '../component/ArticleSearchBar'
import { getFileTypeMeta } from '../component/ExtentionIcon'

const ITEMS_PER_PAGE = 9;
function MyDocumentGrid() {
    const articleImageHeader = global.ftpServe('/elibrary/Foto/my-document-pict.png');
    const { getPrivateArticles: privateArticles } = elibraryArticlesHooks({ getPublicArticles: false, getPrivateArticles: true })
    const navigate = useNavigate()
    const {
        searchTerm, setSearchTerm,
        selectedCategory, setSelectedCategory,
        categoryOptions,
        filteredArticles,
    } = useArticleSearch(privateArticles)

    const [page, setPage] = useState(1)
    const totalPages = Math.ceil((privateArticles?.length || 0) / ITEMS_PER_PAGE)

    const paginatedArticles = useMemo(() => {
        const sorted = [...filteredArticles].sort((a, b) => {
            return moment(b.created_at).valueOf() - moment(a.created_at).valueOf()
        })

        const start = (page - 1) * ITEMS_PER_PAGE
        return sorted.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredArticles, page])

    const handlePageChange = (event, value) => {
        setPage(value)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleOpenPreview = (article) => {
        navigate('/mydocument/update', {state : {article}})
    }

    const articleCreate = () => {
        navigate('/mydocument/create')
    }

    const [uploadOpen, setUploadOpen] = useState(false)

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={2} sx={{ mb: 5 }}>
                <Grid size={{xs: 12, md:4}}>
                    <img src={articleImageHeader} alt="" style={{ maxWidth: '100%', height:'auto', objectFit: 'contain'}} />
                </Grid>
                <Grid size={{xs: 12, md:8}}>
                    <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                        <h2>My Document</h2>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                            <Button variant="contained" onClick={() => setUploadOpen(true)}>Bulk Upload</Button>
                            <Button variant="contained" onClick={articleCreate}>Create</Button>
                        </Box>
                    </Box>
                    <ArticleSearchBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        categoryOptions={categoryOptions}
                    />
                </Grid>
            </Grid>
            
            <FileUploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} onUploadSuccess={(data) => {console.log('Upload Success ', data)}} />

            <Divider key="divider" sx={{marginY: 5}} />

            {!privateArticles ? (
                <Grid container spacing={2}>
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <ArticleCardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            ) : privateArticles.length === 0 ? (
                <Grid container spacing={2}>
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <ArticleCardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            ) : (!filteredArticles || filteredArticles.length === 0) ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                    Artikel tidak ditemukan
                </Box>
            ) : (
                <>
                    <Grid container spacing={2}>
                        {paginatedArticles.map((article) => (
                            <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                <ArticleCard article={article} onPreview={handleOpenPreview} />
                            </Grid>
                        ))}
                    </Grid>

                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" shape="rounded" />
                        </Box>
                    )}
                </>
            )}
        </Box>
    )
}

function ArticleCard({ article, onPreview }) {
    const { title, content, code, effective_date, author, categories, statuses, visibility, analytics, bookmark, created_at } = article;
    const fileExtension = article.files?.[0]?.file_extension
    const fileType = getFileTypeMeta(fileExtension)

    const formattedDate = effective_date ? new Date(effective_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }): '-';
    const statusColor = { Active: 'success', Inactive: 'default', Draft: 'warning' }[statuses?.name] || 'default';

    return (
        <Card
            variant="outlined"
            sx={{
                width: '100',
                height: '100%', // FIXED height, bukan '100%'
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: 3, cursor: 'pointer' },
            }}
        >
            <ArticleThumbnail article={article} />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1, overflow: 'hidden' }}>
                {/* header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', minHeight: 32 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                        {/* <FileIcon sx={{ fontSize: 18, color: fileType.color, flexShrink: 0 }} /> */}
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
                        <Typography variant="caption" color="text.secondary" noWrap>{code}</Typography>
                    </Box>
                </Box>

                {/* title - fixed height, bukan minHeight */}
                <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        height: '3.2em',   // FIXED,
                    }}
                >
                    {title}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.5, height: 24, overflow: 'hidden' }}>
                    {categories?.name && <Chip label={categories.name} size="small" variant="outlined" />}
                    {statuses?.name && <Chip label={statuses.name} size="small" color={statusColor} />}
                    {visibility?.name && <Chip label={visibility.name} size="small" variant="outlined" />}
                </Box>

                <Divider sx={{ my: 0.5 }} />

                {/* footer - dorong ke bawah pake margin-top auto */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0, flex: 1 }}>
                        <PersonIcon fontSize="inherit" sx={{ color: 'text.secondary', flexShrink: 0 }} />
                        <Typography variant="caption" color="text.secondary" noWrap>{author?.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                        <VisibilityIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">{analytics?.views ?? 0}</Typography>
                    </Box>
                </Box>

                <Typography variant="caption" color="text.disabled">{formattedDate}</Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button size="small" variant="outlined" onClick={() => onPreview(article)}>Update</Button>
            </CardActions>
        </Card>
    )
}

function MyDocument() {
    return (
        <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, py: 4, px:5, gap: 5 }}>
            <MyDocumentGrid />
        </Container>
    )
}

export default MyDocument