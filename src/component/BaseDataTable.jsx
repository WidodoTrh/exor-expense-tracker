import { useState, useMemo } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Paper,
    Checkbox,
    Skeleton,
    Box,
    Typography,
    Toolbar,
    Alert,
} from '@mui/material'

/**
 * ==============================================================
 * GENERIC DATA TABLE
 * ==============================================================
 *
 * ---- columns: array of {
 *   id: string                    -> unique key kolom, dipakai sebagai `orderBy`
 *   label: string                  -> teks header
 *   align?: 'left'|'right'|'center'
 *   width?: number|string          -> lebar kolom (optional)
 *   sortable?: boolean              -> default true, set false utk kolom Action/Checkbox
 *   noWrap?: boolean                 -> potong teks panjang jadi 1 baris + ellipsis (...), berguna dipasangkan
 *                                        dengan `width` fixed biar konten panjang gak dorong kolom lain
 *   getValue?: (row) => any          -> raw value buat dibandingkan saat sorting (wajib kalau nested field)
 *   render?: (row, rowIndex) => ReactNode -> custom render cell, fallback ke getValue(row) atau row[id]
 * }
 *
 * ---- data: array of object -> data mentah (sudah difilter dari parent, DataTable yg handle sort+pagination)
 *
 * ---- rowKey: (row) => string|number -> unique key tiap row, default row.id
 *
 * ---- SORTING (client-side, default)
 * defaultOrderBy / defaultOrder: initial sort
 *
 * ---- PAGINATION
 * rowsPerPageOptions: default [5, 10, 25]
 * defaultRowsPerPage: default rowsPerPageOptions[0]
 *
 * ---- SERVER-SIDE MODE (opsional)
 * Kalau data & sorting/pagination di-handle backend, set `serverSide={true}` lalu isi:
 *   totalCount: number                          -> total row di server (buat TablePagination)
 *   page, rowsPerPage: controlled dari parent
 *   onPageChange: (newPage) => void
 *   onRowsPerPageChange: (newRowsPerPage) => void
 *   onSortChange: (orderBy, order) => void
 * Kalau serverSide=true, DataTable TIDAK melakukan slice/sort sendiri — data diasumsikan sudah final dari parent.
 *
 * ---- ROW CLICK
 * onRowClick?: (row) => void      -> kalau diisi, row jadi clickable (cursor pointer + hover effect)
 * isRowDisabled?: (row) => boolean -> row tertentu gak bisa diklik/diselect (mis. status archived)
 *
 * ---- SELECTABLE ROWS
 * selectable?: boolean             -> tampilkan checkbox column di kiri
 * selected?: array                 -> controlled selected row keys (opsional, kalau mau controlled dari parent)
 * onSelectionChange?: (selectedKeys[]) => void
 *
 * ---- LOADING & ERROR & EMPTY
 * loading?: boolean                -> tampilkan skeleton rows
 * skeletonRows?: number            -> jumlah baris skeleton, default 5
 * error?: string|null              -> tampilkan Alert error di atas tabel, table body tetap kekunci kosong
 * emptyMessage?: string            -> default "No data available"
 * emptyIcon?: ReactNode            -> optional icon di atas emptyMessage
 *
 * ---- TOOLBAR (opsional)
 * title?: string                   -> judul tabel di toolbar atas
 * toolbarActions?: ReactNode       -> slot custom di kanan toolbar (misal tombol "Add", search box, dll)
 *
 * ---- STYLING
 * dense?: boolean                  -> size="small"
 * stickyHeader?: boolean           -> header nempel pas scroll, butuh maxHeight di container
 * maxHeight?: number|string        -> tinggi max container (dipakai bareng stickyHeader)
 * getRowSx?: (row) => sxObject     -> custom style per row (misal highlight row tertentu)
 * fixedLayout?: boolean            -> default true, pakai table-layout:fixed biar lebar kolom (col.width)
 *                                      gak goyang ngikutin panjang konten row. Set false utk balik ke behavior
 *                                      auto (lebar kolom ngikutin konten terpanjang).
 *                                      Kalau fixedLayout=true, sebaiknya kasih `width` di tiap column config
 *                                      (boleh cuma sebagian, sisanya otomatis bagi rata sisa ruang).
 *                                      Kolom tanpa width + konten panjang WAJIB pasang noWrap/ellipsis manual
 *                                      di dalam `render`, karena fixed layout gak akan auto-expand lagi.
 */
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
}) {
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

    const page = serverSide ? controlledPage ?? 0 : localPage
    const rowsPerPage = serverSide ? controlledRowsPerPage ?? rowsPerPageOptions[0] : localRowsPerPage
    const selected = controlledSelected ?? localSelected

    const activeColumn = columns.find((col) => col.id === orderBy)

    const getSortValue = (row) => {
        if (!activeColumn) return null
        if (activeColumn.getValue) return activeColumn.getValue(row)
        return row?.[activeColumn.id]
    }

    // ---------- sorting logic (skip kalau serverSide, karena data udah final dari backend) ----------
    const sortedData = useMemo(() => {
        if (serverSide || !orderBy) return data
        return [...data].sort((a, b) => {
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
    }, [data, order, orderBy, serverSide])

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

    return (
        <Paper variant="outlined" sx={{ width: '100%', my: 2 }}>
            {(title || toolbarActions) && (
                <Toolbar sx={{ pl: 2, pr: 2, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                    {title && (
                        <Typography variant="h6" component="div">
                            {title}
                        </Typography>
                    )}
                    {toolbarActions && <Box sx={{ display: 'flex', gap: 1 }}>{toolbarActions}</Box>}
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
                    sx={fixedLayout ? { tableLayout: 'fixed' } : undefined}
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
                                        {emptyMessage}
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
            />
        </Paper>
    )
}