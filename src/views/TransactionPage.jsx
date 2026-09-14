import { Chip, Container, Box, Button, TextField, MenuItem, Stack, CircularProgress, Typography, Divider, Autocomplete } from "@mui/material";
import { useState } from 'react';
import { useTransactionsQuery } from "../hooks/useTransactionsQuery";
import { useCategoriesQuery } from "../hooks/useCategoriesQuery";
import { usePaymentType } from "../hooks/usePaymentType";
import { useSnackbar } from 'notistack'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import global from "../appcore/global"

const SPENTS_BY = ['Widodo', 'Putri']
function TransactionPage() {
    const { enqueueSnackbar } = useSnackbar()
    const { ListPaymentType } = usePaymentType()
    const { ListCategory } = useCategoriesQuery()
    const { addTransaction } = useTransactionsQuery()
    const [form, setForm] = useState({
        title: '', spentBy: '', amount: '', category: '', paymentType: '', spendDatetime: global.formatDateLocal(new Date()) ,
    });
    const [submitting, setSubmitting] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const quickAmounts = [5000, 10000, 15000, 20000, 30000, 40000, 50000];

    const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    const handleDateChange = (newValue) => {
        const formatted = newValue ? `${newValue.getFullYear()}-${String(newValue.getMonth() + 1).padStart(2, '0')}-${String(newValue.getDate()).padStart(2, '0')}` : '';
        setForm((f) => ({ ...f, spendDatetime: formatted }));
    };



    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await addTransaction({
                ...form,
                amount: parseFloat(form.amount) || 0,
            });
            setForm({ title: '', spentBy: '', amount: '', category: '', paymentType: '', spendDatetime: global.formatDateLocal(new Date())});
            enqueueSnackbar('Transaction saved successfuly', { variant: 'success', anchorOrigin: {vertical: 'top', horizontal: 'center'}});
        } catch (err) {
            console.error('Failed to add transaction:', err);
            const errMsg = err?.response?.data?.error || err?.response?.data?.detail || err.message || 'Gagal menyimpan transaksi';
            enqueueSnackbar(errMsg, {variant: 'error', anchorOrigin: {vertical: 'top', horizontal: 'center'}})
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <Container maxWidth="md" sx={{justifyContent: 'center', marginY: 2}}>
            <Typography variant="h4" fontWeight={700} sx={{mb: 2}}>
                Add new transaction
            </Typography>
            <Divider />
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Stack spacing={2} sx={{ marginY: 2 }}>
                    <TextField label="Title" value={form.title} onChange={handleChange('title')} fullWidth size="small" />
                    <TextField
                        size="small"
                        select 
                        label="Spent By" 
                        value={form.spentBy} 
                        onChange={handleChange('spentBy')} 
                        fullWidth 
                    >
                        {SPENTS_BY.map((c) => (
                            <MenuItem key={c} value={c}>{c}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        size="small"
                        label="Amount"
                        value={form.amount}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*\.?\d*$/.test(val)) {
                                setForm((f) => ({ ...f, amount: val }));
                            }
                        }}
                        fullWidth
                        slotProps={{
                            htmlInput: { inputMode: 'decimal' },
                        }}
                    />
                    <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap'}}>
                        {quickAmounts.map((amt) => (
                            <Chip
                                key={amt}
                                label={amt.toLocaleString('id-ID')}
                                size="medium"
                                clickable
                                variant={form.amount === String(amt) ? 'filled' : 'outlined'}
                                color={form.amount === String(amt) ? 'primary' : 'default'}
                                onClick={() => setForm((f) => ({ ...f, amount: String(amt) }))}
                            />
                        ))}
                    </Stack>
                    <Autocomplete
                        size="small"
                        options={ListCategory}
                        getOptionLabel={(option) => option.name}
                        value={ListCategory.find((c) => c.name === form.category) || null}
                        onChange={(event, newValue) => {
                            setForm((f) => ({ ...f, category: newValue?.name || '' }));
                        }}
                        isOptionEqualToValue={(option, value) => option.name === value.name}
                        renderInput={(params) => (
                            <TextField {...params} label="Category" fullWidth />
                        )}
                        slotProps={{
                            listbox: {
                                sx: { maxHeight: 250 },
                            },
                        }}
                    />

                    <Autocomplete
                        size="small"
                        options={ListPaymentType}
                        getOptionLabel={(option) => option.name}
                        value={ListPaymentType.find((c) => c.name === form.paymentType) || null}
                        onChange={(event, newValue) => {
                            setForm((f) => ({ ...f, paymentType: newValue?.name || '' }));
                        }}
                        isOptionEqualToValue={(option, value) => option.name === value.name}
                        renderInput={(params) => (
                            <TextField {...params} label="Payment Type" fullWidth />
                        )}
                        slotProps={{
                            listbox: {
                                sx: { maxHeight: 250 },
                            },
                        }}
                    />

                    <DatePicker
                        label="Spend Date"
                        value={form.spendDatetime ? new Date(form.spendDatetime) : null}
                        onChange={handleDateChange}
                        open={datePickerOpen}
                        onOpen={() => setDatePickerOpen(true)}
                        onClose={() => setDatePickerOpen(false)}
                        slotProps={{
                            textField: {
                                size:"small",
                                fullWidth: true,
                                onClick: () => setDatePickerOpen(true),
                                slotProps: {
                                    readOnly: true
                                },
                            },
                        }}
                    />
                </Stack>

                <Button variant="contained" onClick={handleSubmit} disabled={submitting} startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : 'Save'}>
                    {/* {submitting ? <CircularProgress />  : 'Save'} */}
                </Button>
            </Box>
        </Container>
    )
}


export default TransactionPage