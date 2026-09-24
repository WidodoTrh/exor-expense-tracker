import { useState, useRef } from 'react';
import { Chip, Tooltip, Autocomplete, Box, Card, CardContent, Typography, TextField, Button, MenuItem, Stack, Container, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCategoriesQuery, useCashflowTypesQuery, usePaymentTypesQuery } from '../hooks/useMasterOpt';
import { SlideDownTransition, GrowTransition, ZoomTransition } from '../component/TransitionEffect';
import { useConfirmDialog } from "../component/BaseConfirmationDialog"
import { useHouseholdMembersQuery } from '../hooks/useHouseholdOpt';
import { useMyProfileQuery } from '../hooks/useMyProfilesOpt';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable from '../component/BaseDataTable'
import GroupRemoveIcon from '@mui/icons-material/GroupRemove';
import useIsMobile from '../hooks/useIsMobile';

export default function InvitePage() {
    const isMobile = useIsMobile()
    const { myProfile } = useMyProfileQuery()
    const { ListCategory, addCategory, dropCategory, onCategoryLoad } = useCategoriesQuery();
    const { cashflowTypes } = useCashflowTypesQuery();
    const { ListPaymentType, onPaymenttypeLoad, dropPaymentType, addPaymentType } = usePaymentTypesQuery()
    const { members, memberOnLoad, dropMember } = useHouseholdMembersQuery()
    const {confirm, ConfirmDialog} = useConfirmDialog()

    const inputCategoryField = useRef(null)
    const inputPaymentTypeField = useRef(null)

    const [ addCategoryForm, setAddCategoryForm] = useState({
            name: '', 
            cashflow_type_id: '',
        });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [PTdialogOpen, setPTdialog] = useState(false);
    const [ memberDialog, setMemberDialog ] = useState(false)
    const [deleting, setDeleting] = useState(false);

    const [pyType, setpyType] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [tabVal, setTabVal] = useState(0)
    const { enqueueSnackbar } = useSnackbar();

    // init dt categories 
    const dt_categories = [
        {
            id: 'name',
            label: 'Category Title',
            noWrap: false,
        },
        {
            id: 'action',
            label: 'Action',
            sortable: false,
            render: (row) => {
                return (
                    <Tooltip title='Remove Category' placement="right">
                        <Button startIcon={<DeleteIcon />} color="error" onClick={() => getConfirmDialog(row, 'category')} disabled={deleting} />
                    </Tooltip>
                ) 
            },
            noWrap: false
        }
    ]
    // init dt paymentType
    const dt_paymentType = [
        {
            id: 'name', 
            label: 'Payment Type',
            noWrap: false,
        },
        {
            id: 'action',
            label: 'Action',
            sortable: false,
            render: (row) => {
                return (
                    <Tooltip title='Remove Payment Type' placement="right">
                        <Button startIcon={<DeleteIcon />} color="error" onClick={() => getConfirmDialog(row, 'payment_type')} disabled={deleting} />
                    </Tooltip>
                ) 
            }
        }
    ]

    // init dt members

    const dt_housholdMember = [
        {
            id: 'name',
            label: 'Member Name',
            render: (row) => row.profiles?.display_name,
            noWrap: false
        },
        {
            id: 'email',
            label: 'Email',
            noWrap: true,
            render: (row) => {
                return (
                    <Tooltip title={row.profiles?.email} placement="top">
                        {row.profiles?.email}
                    </Tooltip>  
                )
            }
        },
        {
            id: 'role',
            label: 'Role',
            noWrap: true,
            render: (row) => {
                return ( 
                    <Chip label={row.role} />
                )
            }
        },
        {
            id: 'action',
            label: 'Action',
            sortable: false,
            render: (row) => {
                return (
                    <Tooltip title='Remove Member' placement="right">
                        <Button startIcon={<GroupRemoveIcon />} color="error" onClick={() => getConfirmDialog(row, 'member_remove')} disabled={deleting} />
                    </Tooltip> 
                )
            },
            noWrap: true
        }
    ]

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

    const drop_typeof = async (v, c) => {
        setDeleting(true)
        try {
            switch (c) {
                case 'payment_type':
                    await dropPaymentType(v.id)        
                    break;
                case 'category':
                    await dropCategory(v.id)
                    break;
                case 'member_remove':
                    await dropMember({ user_id: v.user_id, household_id: myProfile?.household_id })
                    break;
                default:
                    throw new Error(`Unknown delete type : ${c}`)
            }
            enqueueSnackbar(`data successfuly deleted`, { variant: 'success' });
        } catch (error) {
            const message = error?.response?.data?.error || error.message;
            enqueueSnackbar(message, { variant: 'error' });
        } finally {
            setDeleting(false)
        }
    }

    const getConfirmDialog = async (v,c) => {
        const message = 'Are you sure delete this record?'
        const y = await confirm(`Delet - ${v.name || v.profiles?.display_name}`, message)
        if (y) {
            drop_typeof(v,c)
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
            <Tabs value={tabVal} onChange={handleTabChange} sx={{marginY: 2}} variant={isMobile ? 'fullWidth' : 'scrollable'} scrollButtons={isMobile ? false : 'auto'}>
                <Tab label="Household Member" />
                <Tab label="Categories Configuration" />
                <Tab label="Payment Type Configuration" />
            </Tabs>
            {ConfirmDialog}

            {tabVal === 0 &&
                <Box>
                    <Button variant='contained' startIcon={<AddIcon />} onClick={() => setMemberDialog(true)}>
                        Add member
                    </Button>
                    <InviteMemberDialog open={memberDialog} onClose={() => setMemberDialog(false)} householdId={myProfile?.household_id} />
                    <DataTable dense minTableWidth={0} loading={memberOnLoad} columns={dt_housholdMember} data={members} rowKey={(row) => row.user_id} defaultOrderBy="name" defaultOrder="asc" searchable searchPlaceholder="Search"/>
                </Box>
            }

            {tabVal === 1 &&
                <Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
                        Add new category
                    </Button>
                    <DataTable dense minTableWidth={0} loading={onCategoryLoad} columns={dt_categories} data={ListCategory} rowKey={(row) => row.id} defaultOrderBy="name" defaultOrder="asc" searchable searchPlaceholder="Search"/>

                    <Dialog 
                        open={dialogOpen} 
                        onClose={handleClose} 
                        fullWidth 
                        maxWidth="sm" 
                        slots={{transition: GrowTransition}} 
                        slotProps={{
                            transition: {
                                timeout: 650,
                                onEntered: () => {
                                    inputCategoryField.current?.focus()
                                }
                            }
                        }}
                    >
                        <DialogTitle>Add Category</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                <TextField
                                    size="small"
                                    label="Category Name"
                                    value={addCategoryForm.name}
                                    onChange={handleFormChange('name')}
                                    fullWidth
                                    inputRef={inputCategoryField}
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
            {tabVal === 2 &&
                <Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPTdialog(true)}>
                        Add new Payment Type
                    </Button>
                    <DataTable dense minTableWidth={0} loading={onPaymenttypeLoad} columns={dt_paymentType} data={ListPaymentType} rowKey={(row) => row.id} defaultOrderBy="name" defaultOrder="asc" searchable searchPlaceholder="Search"/>

                    <Dialog open={PTdialogOpen} onClose={handleClosePT} fullWidth maxWidth="sm" slots={{transition: GrowTransition}} slotProps={{transition: {timeout: 650, onEntered: () => inputPaymentTypeField.current?.focus()}}}>
                        <DialogTitle>Add Payment Type</DialogTitle>
                        <DialogContent>
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                <TextField
                                    label="Payment Type"
                                    value={pyType}
                                    onChange={(e) => setpyType(e.target.value)}
                                    fullWidth
                                    inputRef={inputPaymentTypeField}
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

function InviteMemberDialog({ open, onClose, householdId }) {
    const [email, setEmail] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const { inviteMember } = useHouseholdMembersQuery()
    const { enqueueSnackbar } = useSnackbar()

    const handleSubmit = async () => {
        if (!email.trim()) return
        setSubmitting(true)
        try {
            await inviteMember({ email: email.trim(), household_id: householdId })
            enqueueSnackbar('Add member successfuly', { variant: 'success' })
            setEmail('')
            onClose()
        } catch (err) {
            const message = err?.response?.data?.error || err.message
            enqueueSnackbar(message, { variant: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    const onDialogMemberClose = () => {
        setEmail('')
    }

    return (
        <Dialog open={open} onClose={onDialogMemberClose} fullWidth maxWidth="xs" slots={{transition: GrowTransition}} slotProps={{transition: {timeout: 650}}}>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogContent>
                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    sx={{ mt: 1 }}
                    helperText="Inveted user must have an account on this app first"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={!email || submitting}>
                    {submitting ? 'Inviting...' : 'Invite'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}