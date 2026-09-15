import { useState } from 'react';
import { Autocomplete, Box, Card, CardContent, Typography, TextField, Button, MenuItem, Stack, Container, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCategoriesQuery, useCashflowTypesQuery, usePaymentTypesQuery } from '../hooks/useMasterQuery';
import { SlideDownTransition, GrowTransition, ZoomTransition } from '../component/TransitionEffect';
import { useConfirmDialog } from "../component/BaseConfirmationDialog"

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../component/BaseDataTable'

const TYPES = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

export default function InvitePage() {
    const { ListCategory, addCategory, dropCategory, onCategoryLoad } = useCategoriesQuery();
    const { cashflowTypes } = useCashflowTypesQuery();
    const { ListPaymentType, onPaymenttypeLoad, addPaymentType } = usePaymentTypesQuery()
    const {confirm, ConfirmDialog} = useConfirmDialog()

    const [ addCategoryForm, setAddCategoryForm] = useState({
            name: '', cashflow_type_id: '',
        });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [PTdialogOpen, setPTdialog] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [pyType, setpyType] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [tabVal, setTabVal] = useState(0)
    const { enqueueSnackbar } = useSnackbar();

    // dt categories
    const dt_categories = [
        {
            id: 'name',
            label: 'Category Title'
        },
        {
            id: 'action',
            label: 'Action',
            sortable: false,
            render: (row) => {
                return <Button startIcon={<DeleteIcon />} color="error" onClick={() => getConfirmDialog(row)} disabled={deleting} />
            }
        }
    ]
    const dt_paymentType = [{id: 'name', label: 'Payment Type'}]

    const handleFormChange = (field) => (e) => setAddCategoryForm((f) => ({ ...f, [field]: e.target.value }));
    const handleTabChange = (event, newVal) => (
        setTabVal(newVal)
    )

    const handleClose = () => {
        setAddCategoryForm({name: '', cashflow_type_id: ''});
        setDialogOpen(false)
    };

    const handleClosePT = () => {
        setpyType('');
        setPTdialog(false)
    };

    const handleSubmitCategory = async () => {
        if (!addCategoryForm.name.trim() || !addCategoryForm.cashflow_type_id.trim()) {
            enqueueSnackbar('Field must be not empy', { variant: 'error' });
            return;
        };
        setSubmitting(true);
        try {
            const res = await addCategory(addCategoryForm);
            enqueueSnackbar(`${res.category.name} successfuly added`, { variant: 'success' });
            handleClose();
        } catch (err) {
            const message = err?.response?.data?.error || err.message || 'Failed to add new category';
            enqueueSnackbar(message, { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    const drop_category = async (v) => {
        setDeleting(true)
        try {
            await dropCategory(v.id)
            enqueueSnackbar(`${v.name} successfuly deleted`, { variant: 'success' });
        } catch (error) {
            const message = error?.response?.data?.error || error.message;
            enqueueSnackbar(message, { variant: 'error' });
        } finally {
            setDeleting(false)
        }
    }

    const getConfirmDialog = async (v) => {
        const currCategory = v.name
        const message = `${currCategory} - Are you sure you want to delete this category ?`
        const y = await confirm('Delete Category', message)
        if (y) {
            drop_category(v)
        }
    }

    const handleSubmitPT = async () => {
        if (!pyType.trim()) return;
        setSubmitting(true);
        try {
            await addPaymentType({ name: pyType.trim()});
            enqueueSnackbar('Payment Type Successfuly Added', { variant: 'success' });
            handleClosePT();
        } catch (err) {
            const message = err?.response?.data?.error || err.message || 'Failed to add payment type';
            enqueueSnackbar(message, { variant: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Tabs value={tabVal} onChange={handleTabChange} sx={{marginY: 2}} variant="scrollable" scrollButtons="auto">
                <Tab label="Categories Configuration" />
                <Tab label="Payment Type Configuration" />
            </Tabs>
            {ConfirmDialog}

            {tabVal === 0 &&
            <Box>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                    Add new category
                </Button>
                <DataTable loading={onCategoryLoad} columns={dt_categories} data={ListCategory} rowKey={(row) => row.id} defaultOrderBy="name" defaultOrder="asc" searchable searchPlaceholder="Search"/>

                <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm" slots={{transition: GrowTransition}} slotProps={{transition: {timeout: 650}}}>
                    <DialogTitle>Add Category</DialogTitle>
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                size="small"
                                label="Category Name"
                                value={addCategoryForm.name}
                                onChange={handleFormChange('name')}
                                fullWidth
                                autoFocus
                            />
                            <Autocomplete
                                size="small"
                                options={cashflowTypes}
                                getOptionLabel={(option) => option.name}
                                value={cashflowTypes.find((c) => c.id === addCategoryForm.cashflow_type_id) || null}
                                onChange={(event, newValue) => {
                                    setAddCategoryForm((f) => ({ ...f, cashflow_type_id : newValue?.id || '' }));
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                renderInput={(params) => (
                                    <TextField {...params} label="Cashflow Type" fullWidth />
                                )}
                                slotProps={{
                                    listbox: { sx: { maxHeight: 250 } },
                                }}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button variant="contained" onClick={handleSubmitCategory} disabled={submitting || !addCategoryForm.name.trim()}>
                            {submitting ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
            }
            {/* payment type list data */}
            {tabVal === 1 &&
                <Box>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setPTdialog(true)}>
                        Add new Payment Type
                    </Button>
                    <DataTable loading={onPaymenttypeLoad} columns={dt_paymentType} data={ListPaymentType} rowKey={(row) => row.id} defaultOrderBy="name" defaultOrder="asc" searchable searchPlaceholder="Search"/>

                    <Dialog open={PTdialogOpen} onClose={handleClosePT} fullWidth maxWidth="sm" slots={{transition: GrowTransition}} slotProps={{transition: {timeout: 650}}}>
                        <DialogTitle>Add Payment Type</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                <TextField
                                    label="Payment Type"
                                    value={pyType}
                                    onChange={(e) => setpyType(e.target.value)}
                                    fullWidth
                                    autoFocus
                                />
                            </Stack>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClosePT}>Cancel</Button>
                            <Button variant="contained" onClick={handleSubmitPT} disabled={submitting || !pyType.trim()}>
                                {submitting ? 'Saving...' : 'Save'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            }

        </Container>
    );
}