import global from "../appcore/global"
import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import ArticleThumbnail from '../component/ArticleThumbnail'
import ArticleCardSkeleton from '../component/ArticleCardSkeleton'

import { Box, Container, TextField, Button, Menu, MenuItem, IconButton, Typography, Divider, InputAdornment, CardContent,CardActions,Card, Chip, Grid, Pagination, Dialog, DialogTitle, DialogContent,ToggleButtonGroup,ToggleButton,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,CircularProgress } from "@mui/material"
import VisibilityIcon from '@mui/icons-material/Visibility'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import PersonIcon from '@mui/icons-material/Person'
import CloseIcon from '@mui/icons-material/Close'

import useArticleSearch from '../hooks/useArticleSearch'
import elibraryArticlesHooks from '../hooks/useLibraryArticles'
import elibraryMasterHooks from "../hooks/useLibraryMaster"
import DocumentViewer from "../component/DocumentViewer"
import ArticleSearchBar from '../component/ArticleSearchBar'
import FileTypeBadge, { getFileTypeMeta } from '../component/ExtentionIcon'
import moment from "moment";
import { useSnackbar } from 'notistack'
import authProfiles from '../store/auth';

const ITEMS_PER_PAGE = 9;
function LibraryGrid() {
    const { enqueueSnackbar } = useSnackbar()
    const articleImageHeader = global.ftpServe('/elibrary/Foto/all-lib-pict.png');
    const payload = { v: 3, s: 2 }
    const { 
        actLIBRARY_ARTICLES_ANALYZE, 
        actLIBRARY_GET_ARTICLES_SINGLE, 
        getPublicArticles, 
        isLoadingArticles 
    } = elibraryArticlesHooks({ getPublicArticles: true, getPublicArticlesDetail: false}, payload)
    const {getCategories:categoryOptions} = elibraryMasterHooks({getCategories : true, getUsers: false, getVisibility: false, getStatus: false})

    const [searchParams] = useSearchParams()
    const [articleFilters, setArticleFilters] = useState({
        bookmark: false,
        popular: false,
        date: '',
        author: '',
    })

    const {
        searchTerm, setSearchTerm,
        selectedCategory, setSelectedCategory,
        filteredArticles,
    } = useArticleSearch(getPublicArticles, articleFilters)

    const [page, setPage] = useState(1)
    const [selectedArticle, setSelectedArticle] = useState(null)
    const [selectedReference, setSelectedReference] = useState(null)
    const [viewing, setviewing] = useState(false)

    const totalPages = Math.ceil((filteredArticles?.length || 0) / ITEMS_PER_PAGE)

    const paginatedArticles = useMemo(() => {
        const start = (page - 1) * ITEMS_PER_PAGE
        return filteredArticles.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredArticles, page])

     useEffect(() => {
        const paramSearch = searchParams.get('search')
        const paramCategory = searchParams.get('category')

        setSearchTerm(paramSearch || '')
        setSelectedCategory(paramCategory || 'all')
        setArticleFilters({
            bookmark: searchParams.get('bookmark') === 'true',
            popular: searchParams.get('popular') === 'true',
            date: searchParams.get('date') || '',
            author: searchParams.get('author') || '',
        })
    }, [searchParams, setSearchTerm, setSelectedCategory])

    useEffect(() => {
        setPage(1)
    }, [filteredArticles])

    const handlePageChange = (event, value) => {
        setPage(value)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleOpenPreview = async(article) => {
        try {
            setSelectedArticle(article);
            await actLIBRARY_ARTICLES_ANALYZE({ article_id: article.id });
        } catch (error) {
            enqueueSnackbar(`${error.data.detail.msg}`, { variant: 'error' })
            
        }
    }

    const openReferenceDialog = async() => {
        setviewing(true)
        try {
            let currArticleById = await actLIBRARY_GET_ARTICLES_SINGLE(selectedArticle.id);
            setSelectedReference(currArticleById.data)
            
        } catch (error) {
            enqueueSnackbar(`Error`, { variant: 'error' })
            setviewing(false)
        } finally {
            setviewing(false)
        }
    }

    const closedRefDialog = () => {
        setSelectedReference(null)
    }

    const handleClosePreview = () => setSelectedArticle(null)
    const readOnlyFieldSx = {
        '& .MuiOutlinedInput-root': {
            cursor: 'default',
            '& input, & textarea': { cursor: 'default' },
            '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.23)',
                borderWidth: '1px',
            },
        },
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Grid container spacing={2} sx={{ mb: 5 }}>
                <Grid size={{xs: 12, md:4}}>
                    <img src={articleImageHeader} alt="" style={{ maxWidth: '100%', height:'auto', objectFit: 'contain'}} />
                </Grid>
                <Grid size={{xs: 12, md:8}}>
                    <h2>List of Document Library</h2>
                    <ArticleSearchBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        categoryOptions={categoryOptions}
                    />
                </Grid>
            </Grid>

            <Divider key="divider" sx={{marginY: 5}} />

            {isLoadingArticles ? (
                <Grid container spacing={2}>
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                            <ArticleCardSkeleton />
                        </Grid>
                    ))}
                </Grid>
            ) : getPublicArticles.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                    Artikel tidak ditemukan
                </Box>
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

            <Dialog open={!!selectedReference}  maxWidth="xl" fullWidth scroll="paper">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" component="span" noWrap sx={{ pr: 2 }}>
                        File References of {selectedReference?.title}
                    </Typography>
                    <IconButton size="small" onClick={closedRefDialog}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{display: 'flex'}}>
                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                            <Table>
                                <TableHead >
                                    <TableRow>
                                        <TableCell>Document Title</TableCell>
                                        <TableCell>Document Name</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedReference?.references && selectedReference?.references.length > 0 ? (
                                        selectedReference.references.map((ref) => (
                                            <TableRow key={ref.id}>
                                                <TableCell>{ref.article_code}</TableCell>
                                                <TableCell>{ref.article.title}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={2} align="center" sx={{color: 'secondary.main'}}>
                                                No data available
                                            </TableCell>
                                        </TableRow>

                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedArticle} onClose={handleClosePreview} maxWidth="xl" fullWidth scroll="paper">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" component="span" noWrap sx={{ pr: 2 }}>
                        {selectedArticle?.title}
                    </Typography>
                    <IconButton onClick={handleClosePreview} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                            <DocumentViewer encFileName={selectedArticle?.files?.[0]?.file_path?.split('/').pop()} fileExtension={selectedArticle?.files?.[0]?.file_extension}/>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{display: 'flex', flexDirection: 'column', gap:2, marginTop:4}}>
                            <TextField slotProps={{inputLabel:{shrink: true}, input:{readOnly: true}}} label="Author" value={selectedArticle?.author?.name ?? ''} onFocus={(e) => e.target.blur()} sx={readOnlyFieldSx}></TextField>
                            <TextField slotProps={{inputLabel:{shrink: true}, input:{readOnly: true}}} label="Categories" value={selectedArticle?.categories?.name ?? ''} onFocus={(e) => e.target.blur()} sx={readOnlyFieldSx}></TextField>
                            <TextField slotProps={{inputLabel:{shrink: true}, input:{readOnly: true}}} label="Description" value={selectedArticle?.content ?? ''} multiline minRows={3} fullWidth onFocus={(e) => e.target.blur()} sx={readOnlyFieldSx}></TextField>
                            <TextField slotProps={{inputLabel:{shrink: true}, input:{readOnly: true}}} label="Created By" value={moment(selectedArticle?.created_at).format("DD MMM YYYY")} onFocus={(e) => e.target.blur()} sx={readOnlyFieldSx}></TextField>
                            <TextField slotProps={{inputLabel:{shrink: true}, input:{readOnly: true}}} label="Status" value={selectedArticle?.statuses?.name ?? ''} onFocus={(e) => e.target.blur()} sx={readOnlyFieldSx}></TextField>

                            <Divider sx={{ my: 0.5 }} />
                            <Box>
                                <Button sx={{ minWidth: 140 }} variant="contained" onClick={openReferenceDialog} disabled={viewing}>{viewing ? <CircularProgress size={20} color="inherit" /> : 'View Reference'}</Button>
                            </Box>
                            
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </Box>
    )
}

function ArticleCard({ article, onPreview }) {
    const { enqueueSnackbar } = useSnackbar()
    const { actLIBRARY_BOOKMARK_ARTICLES, actLIBRARY_BOOKMARK_ARTICLES_DEL, setBookmarkStatus } = elibraryArticlesHooks()
    const { title, content, code, effective_date, author, categories, statuses, visibility, analytics, created_at } = article;
    const fileExtension = article.files?.[0]?.file_extension
    const fileType = getFileTypeMeta(fileExtension)
    
    const [bookmarking, setBookmarking] = useState(false);
    const isBookmarked = article?.bookmark || false;
    const myProfile = authProfiles((state) => state.state_AUTH_PROFILE)

    const handleBookmarkTrue = async () => {
        const formData = new FormData()
        formData.append('article_id', article.id);
        formData.append('user_id', myProfile?.id)

        setBookmarking(true);
        try {
            const res = await actLIBRARY_BOOKMARK_ARTICLES(formData)
            setBookmarkStatus(article.id, true)
            enqueueSnackbar(`${res?.data?.message}`, { variant: 'success' })
        } catch (error) {
            enqueueSnackbar(`${error.response.data.message}`, { variant: 'error' })
        } finally {
            setBookmarking(false)
        }
    }

    const handleBookmarkFalse =async () => {
        setBookmarking(true);
        try {
            const res = await actLIBRARY_BOOKMARK_ARTICLES_DEL(article.id)
            setBookmarkStatus(article.id,false);
            enqueueSnackbar(`${res?.data?.message}`, { variant: 'success' })
        } catch (error) {
            enqueueSnackbar(`${error.response.data.message}`, { variant: 'error' })
        } finally {
            setBookmarking(false)
        }
    }

    const handleToggleBookmark = () => {
        if (isBookmarked) {
            handleBookmarkFalse();
        } else {
            handleBookmarkTrue();
        }
    };

    const statusColor = {Active: 'success', Inactive: 'default', Draft: 'warning'}[statuses?.name] || 'default';


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
                    <IconButton onClick={handleToggleBookmark} disabled={bookmarking}>
                        {bookmarking ? (
                            <CircularProgress size={20} />
                        ) : isBookmarked ? (
                            <BookmarkIcon color="warning" />
                        ) : (
                            <BookmarkBorderIcon />
                        )}
                    </IconButton>
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
                        height: '3.2em',   // FIXED, bukan minHeight
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

                <Typography variant="caption" color="text.disabled">{moment(effective_date).format('DD MMM yyyy')}</Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, pt: 0 , display: 'flex', justifyContent: 'flex-start'}}>
                <Button
                    variant="contained"
                    onClick={() => onPreview(article)}
                    startIcon={<VisibilityIcon />}
                >
                    View
                </Button>
            </CardActions>
        </Card>
    )
}


function Library() {
    return (
        <Container maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, py: 4, px:5, gap: 5 }}>
            <LibraryGrid />
        </Container>
    )
}

export default Library