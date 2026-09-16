import { Box, Grid, Container, FormControl, Card, CardContent, Typography, MenuItem, Select, InputLabel, Divider } from "@mui/material";
import DataTable from '../component/BaseDataTable'
import { useState, useEffect } from 'react'
import ChartCard from "../component/ChartCard";
import { useTransactionsQuery } from "../hooks/useTransactionsOpt";
import { useSummaryQuery } from "../hooks/useSummaryOpt";

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
    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num || 0);

    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const { trx, trxError, onTrxLoad } = useTransactionsQuery();
    const { summary, dailySummary, categorySummary, summaryLoading, summaryError } = useSummaryQuery({ month, year });
    
    const dt_trx = [
        {id: 'description', label: 'Transaction Title'},
        {id: 'user_id', label: 'Spend By', render: (row) => row.profiles?.display_name ?? '-'},
        {id: 'amount', label: 'Spend', render: (row) => formatRupiah(row?.amount)},
        {id: 'categories', label: 'Category', render: (row) => row.categories.name},
        {id: 'payment_type', label: 'Payment Type', render: (row) => row.payment_type.name ?? '-'},
        {id: 'transaction_date', label: 'Date'},
    ]

    // console.log('trx')
    
    return (
        <Container maxWidth={false} sx={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" fontWeight={700} sx={{mb: 2}}>
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
                        <Card>
                            <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Total Income — {MONTHS[month - 1]} {year}
                            </Typography>
                            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                                {summaryLoading ? '...' : formatRupiah(summary?.total_income)}
                            </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Total Expense — {MONTHS[month - 1]} {year}
                            </Typography>
                            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                                {summaryLoading ? '...' : formatRupiah(summary?.total_expense)}
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
            </Box>
            <Typography variant="h4" fontWeight={700}>
                Detail Transactions
            </Typography>
            <Divider sx={{maringY: 2}} />
            <Box sx={{ display:'flex', flexDirection:'row', bgcolor:'', gap:2, flexGrow: 1, alignItems: 'center'}}>
                <DataTable loading={onTrxLoad} columns={dt_trx} data={trx} rowKey={(row) => row.id} defaultOrderBy="spend datetime" defaultOrder="desc" searchable searchPlaceholder="Search"/>
            </Box>
        </Container>
    )
}

export default Home