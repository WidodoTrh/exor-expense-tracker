import { useState, useMemo, useEffect } from 'react'
import { useMediaQuery, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableFooter, TablePagination, TableSortLabel, Paper, Checkbox, Skeleton, Box, Typography, Toolbar, Alert, TextField, InputAdornment, IconButton } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'

// ---------- grand total helper ----------
// col.total bisa berupa: 'sum' | 'avg' | 'count' | 'min' | 'max' | (rows) => any
// Nilai yang dijumlahkan diambil dari: col.getTotalValue -> col.getValue -> row[col.id]
// (sengaja TIDAK pakai col.render, karena render biasanya menghasilkan teks/JSX hasil format)
function computeTotal(col, rows) {
    const t = col.total
    if (!t) return undefined
    if (typeof t === 'function') return t(rows)
    if (t === 'count') return rows.length

    const getVal = col.getTotalValue ?? col.getValue ?? ((row) => row?.[col.id])
    const nums = rows
        .map(getVal)
        .filter((v) => v != null && v !== '')
        .map(Number)
        .filter(Number.isFinite)

    switch (t) {
        case 'sum':
            return nums.reduce((acc, n) => acc + n, 0)
        case 'avg':
            return nums.length ? nums.reduce((acc, n) => acc + n, 0) / nums.length : 0
        case 'min':
            return nums.length ? Math.min(...nums) : 0
        case 'max':
            return nums.length ? Math.max(...nums) : 0
        default:
            return undefined
    }
}

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

    // grand total
    // Aktifin per kolom lewat `total` di definisi kolom, contoh:
    //   { id: 'amount', label: 'Amount', total: 'sum', formatTotal: formatRupiah }
    showTotal = false,
    totalLabel = 'Grand total',
    filteredTotalLabel = 'Total (filtered)', // dipakai saat search lagi aktif
    totals, // khusus serverSide: object { [columnId]: value } dari backend (sudah kena filter search)
    stickyTotal = false, // baris total nempel di bawah area tabel (berguna kalau pakai maxHeight)

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

    // const page = serverSide ? controlledPage ?? 0 : localPage
    const rawPage = serverSide ? controlledPage ?? 0 : localPage
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

    const maxPage = Math.max(0, Math.ceil(sortedData.length / rowsPerPage) - 1)
    const page = serverSide ? rawPage : Math.min(rawPage, maxPage)
    useEffect(() => {
        if (!serverSide && localPage !== page) setLocalPage(page)
    }, [serverSide, localPage, page])

    // ---------- pagination logic (skip slice kalau serverSide, karena data yg dikirim udah 1 halaman) ----------
    const paginatedData = useMemo(() => {
        if (serverSide) return sortedData
        const start = page * rowsPerPage
        return sortedData.slice(start, start + rowsPerPage)
    }, [sortedData, page, rowsPerPage, serverSide])

    // ---------- grand total logic ----------
    // Dihitung dari filteredData (SEMUA baris yang lolos search, bukan cuma halaman yang tampil),
    // jadi otomatis ikut berubah tiap search berubah, dan nggak terpengaruh pagination/sorting.
    // Kalau serverSide, nilainya dikirim parent lewat prop `totals`.
    const totalValues = useMemo(() => {
        if (!showTotal) return {}
        if (serverSide) return totals ?? {}
        const result = {}
        columns.forEach((col) => {
            if (col.total) result[col.id] = computeTotal(col, filteredData)
        })
        return result
    }, [showTotal, serverSide, totals, columns, filteredData])

    const firstTotalIdx = columns.findIndex((col) => col.total)
    const isSearching = searchable && (serverSide ? !!controlledSearchValue?.trim() : !!localSearchTerm.trim())

    const renderTotalValue = (col) => {
        const raw = totalValues[col.id]
        if (raw === undefined || raw === null) return '—'
        if (col.formatTotal) return col.formatTotal(raw)
        return typeof raw === 'number' ? raw.toLocaleString() : raw
    }

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

    // baris total: cuma tampil kalau ada kolom yang punya `total`, dan ada data (atau lagi loading)
    const showTotalRow = showTotal && firstTotalIdx !== -1 && (loading || effectiveRowCount > 0)
    // label ditaruh di sel-sel sebelum kolom total pertama (termasuk kolom checkbox kalau selectable)
    const totalLabelSpan = firstTotalIdx + (selectable ? 1 : 0)
    const totalLabelText = isSearching ? filteredTotalLabel : totalLabel

    const totalCellSx = {
        typography: 'body2',
        fontWeight: 700,
        color: 'text.primary',
        bgcolor: 'background.paper',
        borderTop: (t) => `2px solid ${t.palette.divider}`,
        ...(stickyTotal ? { position: 'sticky', bottom: 0, zIndex: 2 } : {}),
    }

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
                        <Typography sx={{mx: 1}} variant="h6" component="div">
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

                    {showTotalRow && (
                        <TableFooter>
                            <TableRow>
                                {totalLabelSpan > 0 && (
                                    <TableCell colSpan={totalLabelSpan} sx={totalCellSx}>
                                        {totalLabelText}
                                    </TableCell>
                                )}
                                {columns.slice(firstTotalIdx).map((col, i) => (
                                    <TableCell key={col.id} align={col.align || 'left'} sx={totalCellSx}>
                                        {/* kalau kolom pertama sendiri punya total, label ditaruh di atas nilainya */}
                                        {i === 0 && totalLabelSpan === 0 && (
                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                                                {totalLabelText}
                                            </Typography>
                                        )}
                                        {col.total
                                            ? loading
                                                ? <Skeleton variant="text" />
                                                : renderTotalValue(col)
                                            : null}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableFooter>
                    )}
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