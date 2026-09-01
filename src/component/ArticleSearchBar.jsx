import { useRef, useState, useEffect } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import HistoryIcon from '@mui/icons-material/History'
import { Grow } from '@mui/material'
import { Menu, Button, Box, TextField, InputAdornment, IconButton, ToggleButtonGroup, ToggleButton, Paper, MenuItem, Typography } from '@mui/material'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckIcon from '@mui/icons-material/Check'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSearchHistory } from '../hooks/useSearchHistory'
import elibraryMasterHooks from '../hooks/useLibraryMaster'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { format } from 'date-fns'

const DRAG_THRESHOLD = 5
function ArticleSearchBar({searchTerm,onSearchChange,selectedCategory,onCategoryChange,categoryOptions,onSubmit,placeholder = 'Cari judul atau kode dokumen...',}) {
    const [inputValue, setInputValue] = useState(searchTerm)
    const { history, addToHistory, clearHistory, removeItem } = useSearchHistory()
    const [showHistory, setShowHistory] = useState(false)
    const wrapperRef = useRef(null)

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            // addToHistory(searchTerm) jgn pake prop, pake state lokal yaitu inputValue
            addToHistory(inputValue)
            setShowHistory(false)
            onSearchChange(inputValue)
            if (onSubmit) onSubmit(inputValue)
        }
    }

    const handleSelectHistory = (term) => {
        setInputValue(term)
        addToHistory(term)
        setShowHistory(false)
        onSearchChange(term)
        if (onSubmit) onSubmit(term)
    }

    const handleClear = () => {
        setInputValue('')
        onSearchChange('')
    }

    useEffect(() => {
        setInputValue(searchTerm)
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowHistory(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [searchTerm])

    const scrollRef = useRef(null)
    const isDragging = useRef(false)
    const startX = useRef(0)
    const scrollStart = useRef(0)
    const dragDistance = useRef(0)
 
    const handleMouseDown = (e) => {
        const el = scrollRef.current
        if (!el) return
        isDragging.current = true
        dragDistance.current = 0
        startX.current = e.pageX - el.offsetLeft
        scrollStart.current = el.scrollLeft
        el.style.cursor = 'grabbing'
    }
 
    const handleMouseMove = (e) => {
        const el = scrollRef.current
        if (!isDragging.current || !el) return
        e.preventDefault()
        const x = e.pageX - el.offsetLeft
        const walk = x - startX.current
        dragDistance.current = Math.abs(walk)
        el.scrollLeft = scrollStart.current - walk
    }
 
    const stopDragging = () => {
        const el = scrollRef.current
        isDragging.current = false
        if (el) el.style.cursor = 'grab'
    }
 
    const handleClickCapture = (e) => {
        if (dragDistance.current > DRAG_THRESHOLD) {
            e.stopPropagation()
            e.preventDefault()
        }
    }

    return (
        <Box sx={{ width:'100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box ref={wrapperRef} sx={{ position: 'relative' }}>
                <TextField
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowHistory(true)}
                    fullWidth
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: inputValue && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={handleClear}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                {showHistory && history.length > 0 && (
                    <Grow in={showHistory && history.length > 0} style={{ transformOrigin: 'top' }}>
                        <Paper
                            elevation={3}
                            sx={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                mt: 0.5,
                                zIndex: 10,
                                maxHeight: 250,
                                overflowY: 'auto',
                            }}
                        >
                            {history.map((item) => (
                                <Box
                                    key={item}
                                    onClick={() => handleSelectHistory(item)}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 1,
                                        px: 2,
                                        py: 1,
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover' },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <HistoryIcon fontSize="small" color="action" />
                                        <Typography variant="body2">{item}</Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            removeItem(item)
                                        }}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                            <Box
                                onClick={clearHistory}
                                sx={{
                                    textAlign: 'center',
                                    color: 'text.secondary',
                                    px: 2,
                                    py: 1,
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'action.hover' },
                                }}
                            >
                                <Typography variant="body2">Clear history</Typography>
                            </Box>
                        </Paper>
                    </Grow>
                )}
            </Box>

            {categoryOptions && categoryOptions.length > 0 && (
                <Box
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={stopDragging}
                    onMouseLeave={stopDragging}
                    onClickCapture={handleClickCapture}
                    sx={{
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                        cursor: 'grab',
                        userSelect: 'none',
                        py: 1,
                        px: 1,
                    }}
                >
                    <ToggleButtonGroup
                        value={selectedCategory}
                        exclusive
                        size="small"
                        onChange={(e, value) => {
                            if (value !== null) onCategoryChange(value)
                        }}
                        sx={{
                            whiteSpace: 'nowrap',
                            gap: 1,
                            '& .MuiToggleButtonGroup-grouped': {
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: '16px !important',
                                px: 2,
                            },
                        }}
                    >
                        <ToggleButton value="all">Semua</ToggleButton>
                        {categoryOptions.map((cat) => (
                            <ToggleButton key={cat.id} value={String(cat.id)}>
                                {cat.name}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>
            )}
            <Box sx={{display: 'flex', justifyContent: 'start'}}>
                <NestedDropdown searchTerm={searchTerm} selectedCategory={selectedCategory} />
            </Box>
        </Box>
    )
}

function NestedDropdown({ searchTerm = '', selectedCategory = 'all' }) {
    const [anchorEl, setAnchorEl] = useState(null)
    const [view, setView] = useState('main')
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const openMenu = Boolean(anchorEl)
    const {getUsers:users} = elibraryMasterHooks({getCategories : false, getUsers: true, getVisibility: false, getStatus: false})
    const activeFilters = {
        bookmark: searchParams.get('bookmark') === 'true',
        popular: searchParams.get('popular') === 'true',
        date: searchParams.get('date') || '',
        author: searchParams.get('author') || '',
    }

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget)
    const handleMenuClose = () => {
        setAnchorEl(null)
        setView('main') // reset balik ke main pas ditutup
    }
    const handleBack = () => setView('main')

    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams)

        if (searchTerm.trim()) {
            params.set('search', searchTerm.trim())
        } else {
            params.delete('search')
        }

        if (selectedCategory !== 'all') {
            params.set('category', selectedCategory)
        } else {
            params.delete('category')
        }

        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        const query = params.toString()
        navigate(`/library${query ? `?${query}` : ''}`)
        handleMenuClose()
    }

    const renderCheck = (isSelected) => isSelected ? <CheckIcon color="primary" fontSize="small" /> : null

    return (
        <>
            <Button onClick={handleMenuOpen} variant="outlined" startIcon={<FilterAltOutlinedIcon />}>
                Filter
            </Button>

            <Menu 
                anchorEl={anchorEl} 
                open={openMenu} 
                onClose={handleMenuClose}
                slotProps={{
                    paper: {
                        sx: {
                            maxHeight: 350,
                            overflowY: 'auto',
                            width: 'auto',
                        }
                    }
                }}
            >
                {view === 'main' && [
                    <MenuItem
                        key="bookmark"
                        onClick={() => updateFilter('bookmark', activeFilters.bookmark ? '' : 'true')}
                        sx={{ justifyContent: 'space-between' }}
                    >
                        Bookmark
                        {renderCheck(activeFilters.bookmark)}
                    </MenuItem>,
                    <MenuItem
                        key="popular"
                        onClick={() => updateFilter('popular', activeFilters.popular ? '' : 'true')}
                        sx={{ justifyContent: 'space-between' }}
                    >
                        Popular
                        {renderCheck(activeFilters.popular)}
                    </MenuItem>,
                    <MenuItem
                        key="dateUpload"
                        onClick={() => activeFilters.date ? updateFilter('date', '') : setView('dateUpload')}
                        sx={{ justifyContent: 'space-between' }}
                    >
                        Date Upload
                        {activeFilters.date ? renderCheck(true) : <ChevronRightIcon fontSize="small" />}
                    </MenuItem>,
                    <MenuItem
                        key="releaseBy"
                        onClick={() => activeFilters.author ? updateFilter('author', '') : setView('releaseBy')}
                        sx={{ justifyContent: 'space-between' }}
                    >
                        Release By
                        {activeFilters.author ? renderCheck(true) : <ChevronRightIcon fontSize="small" />}
                    </MenuItem>
                ]}

                {view === 'dateUpload' && [
                    <MenuItem key="back" onClick={handleBack} dense>
                        <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
                        Kembali
                    </MenuItem>,
                    <Box key="datepicker" sx={{ px: 2, py: 1, mt: 1 }}>
                        <DatePicker
                            label="Pilih tanggal upload"
                            value={null}
                            onChange={(newDate) => {
                                if (newDate) updateFilter('date', format(newDate, 'yyyy-MM-dd'))
                            }}
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    fullWidth: true,
                                },
                            }}
                        />
                    </Box>
                ]}

                {view === 'releaseBy' && [
                    <MenuItem key="back" onClick={handleBack} dense>
                        <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
                        Kembali
                    </MenuItem>,
                    ...users.map((user) => (
                        <MenuItem
                            key={user.id}
                            onClick={() => updateFilter('author', user.name)}
                            sx={{ justifyContent: 'space-between' }}
                        >
                            {user.name}
                            {renderCheck(activeFilters.author === user.name)}
                        </MenuItem>
                    ))
                ]}
            </Menu>
        </>
    )
}

export default ArticleSearchBar
