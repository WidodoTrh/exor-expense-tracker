import { Button, useTheme, Box, Grid, Container, FormControl, Card, CardContent, Typography, MenuItem, Select, InputLabel, Divider } from "@mui/material";
import { useState, useEffect, useMemo } from 'react'
import { useTransactionsQuery } from "../hooks/useTransactionsOpt";
import { useSummaryQuery } from "../hooks/useSummaryOpt";
import { useCategoriesQuery, useCashflowTypesQuery, usePaymentTypesQuery } from "../hooks/useMasterOpt";
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

import useIsMobile from '../hooks/useIsMobile'
import BulkEditDialog from "../component/BulkDialog";
import global from "../appcore/global";
import EditTransactionDialog from "./UpdateTransactionDialog";
import DataTable from '../component/BaseDataTable'
import ChartCard from "../component/ChartCard";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const MONTHS = [
  'Januari', 
  'Februari', 
  'Maret', 
  'April', 
  'Mei', 
  'Juni',
  'Juli', 
  'Agustus', 
  'September', 
  'Oktober', 
  'November', 
  'Desember',
];

function Home() {
    const theme = useTheme()
    const isMobile = useIsMobile()
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const { trx, trxError, onTrxLoad, revalidating, curSelectedTrx, setCurSelectedTrx, bulkUpdate } = useTransactionsQuery();
    const { summary, dailySummary, categorySummary, summaryLoading, summaryError } = useSummaryQuery({ month, year });

    const [editOpen, setEditOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
    const [bulkOpen, setBulkOpen] = useState(false)
    const { ListCategory } = useCategoriesQuery()
    const { cashflowTypes } = useCashflowTypesQuery()
    const { ListPaymentType } = usePaymentTypesQuery()

    

    const dt_trx = [
        {
            id: 'description',
            label: 'Transaction Title',
            noWrap: true, 
            width: 180,
            render: (row) => {
                return (
                    isMobile ? <Button onClick={() => {setEditOpen(true); setSelectedTx(row)}}> {row.description} </Button> : row.description
                )
            }
        },
        {id: 'user_id', label: 'Spend By', render: (row) => row?.profiles?.display_name ?? '-', noWrap: true, width: 180},
        {id: 'amount', label: 'Spend', render: (row) => global.formatRp(row?.amount), noWrap: true, width: 180, total: 'sum'},
        {id: 'categories', label: 'Category', render: (row) => row?.categories?.name, noWrap: true, width: 180 , getValue: (row) => row?.categories?.name},
        {id: 'payment_type', label: 'Payment Type', render: (row) => row?.payment_type?.name ?? '-', noWrap: true, width: 180},
        {id: 'transaction_date', label: 'Date', noWrap: true, width: 180},
        {
            id: 'action',
            label:'action',
            hideOnMobile: true,
            render: (row) => {
                return (
                    <Button disabled={revalidating} startIcon={<MoreHorizIcon />}  color="primary.light" onClick={() => {setEditOpen(true); setSelectedTx(row)}} />
                )
            },
            width: 180
        }
    ].filter((col) => !(isMobile && col.hideOnMobile))

    return (
        <Container maxWidth={false} sx={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            <EditTransactionDialog open={editOpen} onClose={() => setEditOpen(false)} categories={ListCategory} paymentTypes={ListPaymentType} cashflowTypes={cashflowTypes} transaction={selectedTx} />
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{mb: 2}}>
                    Dashboard
                </Typography>
                <Divider sx={{mb: 2}} />
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ width: { xs: '100%', sm: 260 } }}>
                        <InputLabel>Select Month</InputLabel>
                        <Select value={month} label="Select Month" onChange={(e) => setMonth(e.target.value)}>
                            {MONTHS.map((m, i) => (
                                <MenuItem key={i} value={i + 1}>{m}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ width: { xs: '100%', sm: 260 } }}>
                        <InputLabel>Select Year</InputLabel>
                        <Select value={year} label="Select Year" onChange={(e) => setYear(e.target.value)}>
                            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                                <MenuItem key={y} value={y}>{y}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Grid container spacing={3}>
                    {/* Card total */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{borderRadius: 4}}>
                            <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Total Income — {MONTHS[month - 1]} {year}
                            </Typography>
                            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                                {summaryLoading ? '...' : global.formatRp(summary?.total_income)}
                            </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{borderRadius: 4}}>
                            <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Total Expense — {MONTHS[month - 1]} {year}
                            </Typography>
                            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                                {summaryLoading ? '...' : global.formatRp(summary?.total_expense)}
                            </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <ChartCard
                            height={400}
                            type="line"
                            title="Daily Trend"
                            loading={summaryLoading}
                            data={dailySummary?.map((d) => ({ x: d.day, amount: d.total_expense })) || []}
                            xKey="x"
                            series={[{ key: 'amount', label: 'Amount', color: '#6366f1' }]}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <DailyTransactionTable />
                    </Grid>
                    <Grid size={{ xs: 12, md: 12 }}>
                        <ChartCard
                            height={400}
                            type="bar"
                            barLayout="horizontal"
                            title="Spent by Category"
                            loading={summaryLoading}
                            data={
                                categorySummary.expense
                                ?.slice()
                                .sort((a, b) => b.total_amount - a.total_amount)
                                .map((c) => ({ x: c.category_name, amount: c.total_amount })) || []
                            }
                            xKey="x"
                            series={[{ key: 'amount', label: 'Amount', color: '#6366f1' }]}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{marginY: 2}} />
                <Box sx={{ display:'flex', flexDirection:'row', bgcolor:'', gap:2, flexGrow: 1, alignItems: 'center'}}>
                    <DataTable 
                        showTotal
                        dense 
                        searchable 
                        selectable
                        selected={curSelectedTrx}
                        onSelectionChange={setCurSelectedTrx}
                        toolbarActions={
                            curSelectedTrx.length > 0 && (
                                <Button variant="contained" onClick={() => setBulkOpen(true)}>
                                    Edit {curSelectedTrx.length} selected
                                </Button>
                            )
                        }
                        title="Detail Transaction" 
                        loading={onTrxLoad}
                        columns={dt_trx}
                        data={trx}
                        rowKey={(row) => row.id} 
                        defaultOrderBy="spend datetime"
                        defaultOrder="desc"
                        searchPlaceholder="Search"/>
                </Box>
            </Box>
            <BulkEditDialog
                open={bulkOpen}
                count={curSelectedTrx.length}
                onClose={() => setBulkOpen(false)}
                onSubmit={bulkUpdate}
                categories={ListCategory}
                paymentTypes={ListPaymentType}
                cashflowTypes={cashflowTypes}
            />
        </Container>
    )
}

function DailyTransactionTable() {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const { trx, trxError, onTrxLoad } = useTransactionsQuery()
    const [ dailyDatepickerOpen, setdailyDatepickerOpen ] = useState(false)

    const dailyTrx = useMemo(() => {
        const targetDate = global.formatDateLocal(selectedDate)
        return trx.filter((row) => row.transaction_date === targetDate)
    }, [trx, selectedDate])

    const dt_daily = [
        { id: 'description', label: 'Transaction Title', noWrap: true, width: 180 },
        { id: 'amount', label: 'Spend', render: (row) => global.formatRp(row?.amount), noWrap: true, width: 150, total: 'sum' },
        { id: 'spend_by', label: 'Spend By', render: (row) => row?.profiles?.display_name ?? '-', noWrap: true, width: 150}
    ]

    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <DatePicker
                    label="Transaction Date"
                    value={selectedDate}
                    onChange={(newValue) => newValue && setSelectedDate(newValue)}
                    open={dailyDatepickerOpen}
                    onOpen={() => setdailyDatepickerOpen(true)}
                    onClose={() => setdailyDatepickerOpen(false)}
                    slotProps={{
                        textField: {
                            size:"small",
                            fullWidth: true,
                            onClick: () => setdailyDatepickerOpen(true),
                            slotProps: {
                                readOnly: true
                            },
                        },
                    }}
                />
            </Box>

            <DataTable
                key={global.formatDateLocal(selectedDate)}
                showTotal
                dense
                title="Daily Transaction Detail"
                columns={dt_daily}
                data={dailyTrx}
                rowKey={(row) => row.id}
                loading={onTrxLoad}
                error={trxError}
                emptyMessage={`Tidak ada transaksi pada ${global.formatDateLocal(selectedDate)}`}
            />
        </Box>
    )
}

export default Home