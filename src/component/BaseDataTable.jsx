import { useState, useMemo } from 'react'
import { useMediaQuery, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, Paper, Checkbox, Skeleton, Box, Typography, Toolbar, Alert, TextField, InputAdornment, IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'

export default function DataTable({
    columns = [],
    data = [],
    rowKey = (row) => row.id,

    // sorting
    defaultOrderBy = '',
    defaultOrder = 'asc',

    // pagination
    rowsPerPageOptions = [5, 10, 25],
    defaultRowsPerPage,

    // server-side mode
    serverSide = false,
    totalCount = 0,
    page: controlledPage,
    rowsPerPage: controlledRowsPerPage,
    onPageChange: controlledOnPageChange,
    onRowsPerPageChange: controlledOnRowsPerPageChange,
    onSortChange,

    // search
    searchable = false,
    searchPlaceholder = 'Search...',
    searchValue: controlledSearchValue,
    onSearchChange,
    searchableColumns, // optional array of column ids; default: semua kolom (kecuali col.searchable === false)
    searchDebounceMs = 300,

    // row click
    onRowClick,
    isRowDisabled,

    // selectable
    selectable = false,
    selected: controlledSelected,
    onSelectionChange,

    // loading / error / empty
    loading = false,
    skeletonRows = 5,
    error = null,
    emptyMessage = 'No data available',
    emptyIcon = null,

    // toolbar
    title,
    toolbarActions,

    // styling
    dense = false,
    stickyHeader = false,
    maxHeight,
    getRowSx,
    fixedLayout = true,
    minTableWidth = 650,
}) {

    //  -- mobile layout declare --

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    // ---------- sorting state (local, dipakai kalau bukan serverSide) ----------
    const [order, setOrder] = useState(defaultOrder)
    const [orderBy, setOrderBy] = useState(defaultOrderBy || columns?.[0]?.id || '')

    // ---------- pagination state (local, dipakai kalau bukan serverSide) ----------
    const [localPage, setLocalPage] = useState(0)
    const [localRowsPerPage, setLocalRowsPerPage] = useState(
        defaultRowsPerPage || rowsPerPageOptions[0] || 10
    )

    // ---------- selection state (local, dipakai kalau `selected` gak dikontrol parent) ----------
    const [localSelected, setLocalSelected] = useState([])

    // ---------- search state ----------
    // localSearchInput: nilai yang tampil di TextField (langsung berubah, biar UI responsif)
    // localSearchTerm: nilai yang dipakai buat filter beneran (di-debounce)
    const [localSearchInput, setLocalSearchInput] = useState('')
    const [localSearchTerm, setLocalSearchTerm] = useState('')

    const page = serverSide ? controlledPage ?? 0 : localPage
    const rowsPerPage = serverSide ? controlledRowsPerPage ?? rowsPerPageOptions[0] : localRowsPerPage
    const selected = controlledSelected ?? localSelected
    const searchInputValue = serverSide ? controlledSearchValue ?? '' : localSearchInput

    const activeColumn = columns.find((col) => col.id === orderBy)

    const getSortValue = (row) => {
        if (!activeColumn) return null
        if (activeColumn.getValue) return activeColumn.getValue(row)
        return row?.[activeColumn.id]
    }

    // ---------- search logic (skip kalau serverSide, karena filter dilakukan di backend) ----------
    const searchColumns = useMemo(() => {
        if (!searchable) return []
        return columns.filter((col) =>
            searchableColumns ? searchableColumns.includes(col.id) : col.searchable !== false
        )
    }, [columns, searchable, searchableColumns])

    const filteredData = useMemo(() => {
        if (serverSide || !searchable || !localSearchTerm.trim()) return data
        const term = localSearchTerm.trim().toLowerCase()
        return data.filter((row) =>
            searchColumns.some((col) => {
                const val = col.getSearchValue
                    ? col.getSearchValue(row)
                    : col.getValue
                    ? col.getValue(row)
                    : row?.[col.id]
                if (val == null) return false
                return String(val).toLowerCase().includes(term)
            })
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, localSearchTerm, serverSide, searchable, searchColumns])

    // ---------- sorting logic (skip kalau serverSide, karena data udah final dari backend) ----------
    const sortedData = useMemo(() => {
        if (serverSide || !orderBy) return filteredData
        return [...filteredData].sort((a, b) => {
            const valA = getSortValue(a)
            const valB = getSortValue(b)

            if (valA == null && valB == null) return 0
            if (valA == null) return order === 'asc' ? -1 : 1
            if (valB == null) return order === 'asc' ? 1 : -1

            if (valA < valB) return order === 'asc' ? -1 : 1
            if (valA > valB) return order === 'asc' ? 1 : -1
            return 0
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredData, order, orderBy, serverSide])

    // ---------- pagination logic (skip slice kalau serverSide, karena data yg dikirim udah 1 halaman) ----------
    const paginatedData = useMemo(() => {
        if (serverSide) return sortedData
        const start = page * rowsPerPage
        return sortedData.slice(start, start + rowsPerPage)
    }, [sortedData, page, rowsPerPage, serverSide])

    // ---------- handlers ----------
    const handleRequestSort = (columnId) => {
        const isAsc = orderBy === columnId && order === 'asc'
        const newOrder = isAsc ? 'desc' : 'asc'
        setOrder(newOrder)
        setOrderBy(columnId)
        if (!serverSide) setLocalPage(0)
        onSortChange?.(columnId, newOrder)
    }

    const handleChangePage = (event, newPage) => {
        if (serverSide) {
            controlledOnPageChange?.(newPage)
        } else {
            setLocalPage(newPage)
        }
    }

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10)
        if (serverSide) {
            controlledOnRowsPerPageChange?.(newRowsPerPage)
        } else {
            setLocalRowsPerPage(newRowsPerPage)
            setLocalPage(0)
        }
    }

    // debounce ref buat local search (biar gak filter tiap keystroke kalau data-nya gede)
    const searchTimeoutRef = useState(() => ({ current: null }))[0]

    const handleSearchInputChange = (event) => {
        const value = event.target.value

        if (serverSide) {
            // serverSide: langsung kirim ke parent, biarin parent yang debounce/fetch kalau perlu
            onSearchChange?.(value)
            return
        }

        setLocalSearchInput(value)
        setLocalPage(0)

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        searchTimeoutRef.current = setTimeout(() => {
            setLocalSearchTerm(value)
        }, searchDebounceMs)
    }

    const handleClearSearch = () => {
        if (serverSide) {
            onSearchChange?.('')
            return
        }
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        setLocalSearchInput('')
        setLocalSearchTerm('')
        setLocalPage(0)
    }

    const handleRowClick = (row) => {
        if (isRowDisabled?.(row)) return
        onRowClick?.(row)
    }

    const toggleSelectRow = (row) => {
        if (isRowDisabled?.(row)) return
        const key = rowKey(row)
        const next = selected.includes(key)
            ? selected.filter((k) => k !== key)
            : [...selected, key]
        setLocalSelected(next)
        onSelectionChange?.(next)
    }

    const toggleSelectAll = () => {
        const selectableKeys = paginatedData
            .filter((row) => !isRowDisabled?.(row))
            .map((row) => rowKey(row))
        const allSelected = selectableKeys.length > 0 && selectableKeys.every((k) => selected.includes(k))
        const next = allSelected
            ? selected.filter((k) => !selectableKeys.includes(k))
            : [...new Set([...selected, ...selectableKeys])]
        setLocalSelected(next)
        onSelectionChange?.(next)
    }

    const selectableRowsInPage = paginatedData.filter((row) => !isRowDisabled?.(row))
    const allChecked =
        selectableRowsInPage.length > 0 &&
        selectableRowsInPage.every((row) => selected.includes(rowKey(row)))
    const someChecked = selectableRowsInPage.some((row) => selected.includes(rowKey(row))) && !allChecked

    const colSpanTotal = columns.length + (selectable ? 1 : 0)
    const effectiveRowCount = serverSide ? totalCount : sortedData.length
    const showToolbar = !!(title || toolbarActions || searchable)

    return (
        <Paper variant="outlined" sx={{ width: '100%', my: 2 }}>
            {showToolbar && (
                <Toolbar
                    disableGutters
                    sx={{
                        pl: 1,
                        pr: 2,
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        gap: 2,
                        py: 1.5,
                    }}
                >
                    {title && (
                        <Typography variant="h6" component="div">
                            {title}
                        </Typography>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        {searchable && (
                            <TextField
                                size="small"
                                value={searchInputValue}
                                onChange={handleSearchInputChange}
                                placeholder={searchPlaceholder}
                                fullWidth={isMobile}
                                sx={{ minWidth: isMobile ? 'auto' : 220, flex: isMobile ? '1 1 100%' : 'unset' }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchInputValue ? (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={handleClearSearch} edge="end">
                                                    <ClearIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        ) : null,
                                    },
                                }}
                            />
                        )}
                        {toolbarActions && <Box sx={{ display: 'flex', gap: 1 }}>{toolbarActions}</Box>}
                    </Box>
                </Toolbar>
            )}

            {error && (
                <Box sx={{ px: 2, pt: 2 }}>
                    <Alert severity="error">{error}</Alert>
                </Box>
            )}

            <TableContainer sx={{ maxHeight: maxHeight || undefined }}>
                <Table
                    size={dense ? 'small' : 'medium'}
                    stickyHeader={stickyHeader}
                    sx={{
                        ...(fixedLayout ? { tableLayout: 'fixed' } : undefined),
                        ...(minTableWidth ? { minWidth: minTableWidth } : undefined),
                    }}
                >
                    <TableHead>
                        <TableRow>
                            {selectable && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={someChecked}
                                        checked={allChecked}
                                        onChange={toggleSelectAll}
                                        disabled={loading || selectableRowsInPage.length === 0}
                                    />
                                </TableCell>
                            )}
                            {columns.map((col) => (
                                <TableCell
                                    key={col.id}
                                    align={col.align || 'left'}
                                    style={{ width: col.width }}
                                    sortDirection={orderBy === col.id ? order : false}
                                    sx={
                                        col.noWrap
                                            ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
                                            : undefined
                                    }
                                >
                                    {col.sortable === false ? (
                                        col.label
                                    ) : (
                                        <TableSortLabel
                                            active={orderBy === col.id}
                                            direction={orderBy === col.id ? order : 'asc'}
                                            onClick={() => handleRequestSort(col.id)}
                                        >
                                            {col.label}
                                        </TableSortLabel>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            Array.from({ length: skeletonRows }).map((_, i) => (
                                <TableRow key={`skeleton-${i}`}>
                                    {selectable && (
                                        <TableCell padding="checkbox">
                                            <Skeleton variant="rectangular" width={20} height={20} />
                                        </TableCell>
                                    )}
                                    {columns.map((col) => (
                                        <TableCell key={col.id} align={col.align || 'left'}>
                                            <Skeleton variant="text" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={colSpanTotal} align="center" sx={{ py: 6 }}>
                                    {emptyIcon && <Box sx={{ mb: 1 }}>{emptyIcon}</Box>}
                                    <Typography variant="body2" color="text.secondary">
                                        {searchable && localSearchTerm
                                            ? `No results for "${localSearchTerm}"`
                                            : emptyMessage}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row, rowIndex) => {
                                const key = rowKey(row)
                                const disabled = isRowDisabled?.(row)
                                const isChecked = selected.includes(key)
                                const clickable = !!onRowClick && !disabled

                                return (
                                    <TableRow
                                        key={key}
                                        hover={clickable}
                                        selected={isChecked}
                                        onClick={clickable ? () => handleRowClick(row) : undefined}
                                        sx={{
                                            cursor: clickable ? 'pointer' : 'default',
                                            opacity: disabled ? 0.5 : 1,
                                            ...(getRowSx ? getRowSx(row) : {}),
                                        }}
                                    >
                                        {selectable && (
                                            <TableCell
                                                padding="checkbox"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Checkbox
                                                    checked={isChecked}
                                                    disabled={disabled}
                                                    onChange={() => toggleSelectRow(row)}
                                                />
                                            </TableCell>
                                        )}
                                        {columns.map((col) => (
                                            <TableCell
                                                key={col.id}
                                                align={col.align || 'left'}
                                                sx={
                                                    col.noWrap
                                                        ? {
                                                              whiteSpace: 'nowrap',
                                                              overflow: 'hidden',
                                                              textOverflow: 'ellipsis',
                                                              maxWidth: col.width || 0,
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {col.render
                                                    ? col.render(row, rowIndex)
                                                    : col.getValue
                                                    ? col.getValue(row)
                                                    : row?.[col.id]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={effectiveRowCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={rowsPerPageOptions}
                disabled={loading}
                sx={{
                    '& .MuiTablePagination-toolbar': {
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        rowGap: 1,
                        py: 1,
                    },
                    '& .MuiTablePagination-spacer': {
                        display: { xs: 'none', sm: 'block' },
                    },
                }}
            />
        </Paper>
    )
}