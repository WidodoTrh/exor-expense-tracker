import { Box, Grid, Container, FormControl, Card, CardContent, Typography, MenuItem, Select, InputLabel, Divider } from "@mui/material";
import DataTable from '../component/BaseDataTable'
import { useState, useEffect } from 'react'
import ChartCard from "../component/ChartCard";
import { useTransactionsQuery } from "../hooks/useTransactionsQuery";
import { useSummaryQuery } from "../hooks/useSummaryQuery";

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
    const { summary, summaryLoading, summaryError } = useSummaryQuery({ month, year });
    
    const dt_trx = [
            {id: 'title', label: 'Transaction Title'},
            {id: 'spent by', label: 'Spend By'},
            {id: 'amount', label: 'Spend', render: (row) => formatRupiah(row?.amount)},
            {id: 'category', label: 'Category'},
            {id: 'payment type', label: 'Payment Type'},
            {id: 'spend datetime', label: 'Date'},
        ]
    
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
                        <Select value={month} label="Bulan" onChange={(e) => setMonth(e.target.value)}>
                            {MONTHS.map((m, i) => (
                                <MenuItem key={i} value={i + 1}>{m}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ width: { xs: '100%', sm: 260 } }}>
                        <InputLabel>Select Year</InputLabel>
                        <Select value={year} label="Tahun" onChange={(e) => setYear(e.target.value)}>
                            {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                                <MenuItem key={y} value={y}>{y}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Grid container spacing={3}>
                    {/* Card total */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Card>
                            <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                Total Spent Amount — {MONTHS[month - 1]} {year}
                            </Typography>
                            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                                {summaryLoading ? '...' : formatRupiah(summary?.total)}
                            </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 7 }}>
                        <ChartCard
                            height={400}
                            type="line"
                            title="Daily Trend"
                            loading={summaryLoading}
                            data={summary?.daily?.map((d) => ({ x: d.day, amount: d.amount })) || []}
                            xKey="x"
                            series={[{ key: 'amount', label: 'Amount', color: '#6366f1' }]}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 5 }}>
                        <ChartCard
                            height={400}
                            type="bar"
                            barLayout="horizontal"
                            title="Spent by Category"
                            loading={summaryLoading}
                            data={
                                summary?.byCategory
                                ?.slice()
                                .sort((a, b) => b.amount - a.amount)
                                .map((c) => ({ x: c.category, amount: c.amount })) || []
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