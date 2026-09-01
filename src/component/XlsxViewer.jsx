// components/XlsxViewer.jsx
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { Box, CircularProgress, Table, TableBody, TableCell, TableRow, Tabs, Tab } from '@mui/material'
import { $axPdf } from '../store/api'

function XlsxViewer({ encFileName }) {
    const [sheets, setSheets] = useState([]) // [{ name, rows }]
    const [activeSheet, setActiveSheet] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!encFileName) return
        let cancelled = false
        setLoading(true)
        setError(null)

        $axPdf.get(encFileName)
            .then(resp => resp.data.arrayBuffer())
            .then(arrayBuffer => {
                if (cancelled) return
                const wb = XLSX.read(arrayBuffer, { type: 'array' })
                const parsed = wb.SheetNames.map(name => ({
                    name,
                    rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1 }),
                }))
                setSheets(parsed)
                setActiveSheet(0)
            })
            .catch(err => {
                if (!cancelled) setError('Gagal memuat spreadsheet')
                console.error(err)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [encFileName])

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress size={28} /></Box>
    if (error) return <Box sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>{error}</Box>

    const currentRows = sheets[activeSheet]?.rows || []

    return (
        <Box>
            {sheets.length > 1 && (
                <Tabs value={activeSheet} onChange={(e, v) => setActiveSheet(v)} sx={{ mb: 1 }}>
                    {sheets.map((s, i) => <Tab key={i} label={s.name} />)}
                </Tabs>
            )}
            <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ '& td': { border: '1px solid #eee', whiteSpace: 'nowrap' } }}>
                    <TableBody>
                        {currentRows.map((row, i) => (
                            <TableRow key={i}>
                                {row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Box>
    )
}

export default XlsxViewer