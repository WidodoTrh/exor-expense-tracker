import { Grow, Popper, Box, Button, IconButton, Typography, Divider, Grid, TextField, Autocomplete, Checkbox, Dialog, DialogTitle, DialogContent } from "@mui/material"
import { useSnackbar } from 'notistack'
import { useState, useMemo, useRef } from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import elibraryArticlesHooks from "../hooks/useLibraryArticles"
import elibraryMasterHooks from "../hooks/useLibraryMaster"
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete'
import moment from "moment"

import DataTable from '../component/BaseDataTable'
import FullScreenLoading from '../component/FullScreenLoading'
import { useConfirmDialog } from "../component/BaseConfirmationDialog"

function AnimatedPopper(props) {
    return (
        <Popper {...props} transition>
            {({ TransitionProps }) => (
                <Grow {...TransitionProps} timeout={200}>
                    <div>{props.children}</div>
                </Grow>
            )}
        </Popper>
    );
}

function ArticleManagement() {
    const { enqueueSnackbar } = useSnackbar()

    // lokal state
    const [datepickerOpen, setDatepicker] = useState(false)
    const [is_categories_dialog, set_is_categories_dialog] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedUser, setSelectedUser] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedDate, setSelectedDate] = useState(null)
    const [to_category_submit, set_toCategory] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    const {confirm, ConfirmDialog} = useConfirmDialog()
    const { actLIBRARY_UPDATE_MY_DOC, mutLIBRARY_UPDATE_MY_DOC} = elibraryArticlesHooks()

    // ref
    const category_input = useRef(null)
    const {
        getUsers:users, 
        getCategories: toCategory, 
        actLIBRARY_POST_CATEGORY,
        actLIBRARY_DEL_CATEGORY
    } = elibraryMasterHooks({getCategories : true, getUsers: true, getVisibility: false, getStatus: false})
    const { 
        getPrivateArticles:privArticles, 
        isLoadingArticles
    } = elibraryArticlesHooks({ getPublicArticles: false, getPublicArticlesDetail: false, getPrivateArticles:true})

    const filteredArticles = useMemo(() => {
        return privArticles.filter((article) => {
            const term = searchTerm.trim().toLowerCase()
            const matchesSearch = !term ||
                article?.code?.toLowerCase().includes(term) ||
                article?.title?.toLowerCase().includes(term)

            const matchesUser = !selectedUser || article?.author?.id === selectedUser
            const matchesCategory = !selectedCategory || article?.categories?.id === selectedCategory
            const matchesDate = !selectedDate || moment(article?.created_at).isSame(moment(selectedDate.$d ?? selectedDate), 'day')

            return matchesSearch && matchesUser && matchesCategory && matchesDate
        })
    }, [privArticles, searchTerm, selectedUser, selectedCategory, selectedDate])
    
    const handleAddCatDialog = () => {
        set_is_categories_dialog(true)
    }

    const closedRefDialog = () => {
        set_is_categories_dialog(false)
    }

    const handle_addCategory = async() => {
        const formData = new FormData()
        formData.append('name',to_category_submit);
        if(!to_category_submit) {
            enqueueSnackbar(`Field cannot empty`, { variant: 'error' })
            return
        }

        const y = await confirm('Add Category', <>Are you sure to add <b>{to_category_submit}</b> as new category?</>)
        if (y) {
            try {
                const res = await actLIBRARY_POST_CATEGORY(formData)
                enqueueSnackbar(`${res?.data?.message}`, { variant: 'success' })
            } catch (error) {
                enqueueSnackbar(`${error?.data?.detail?.[0]?.msg}`, { variant: 'error' })
            } finally {
                set_toCategory(null)
                category_input.current.value = null
            }
        }
    }

    const handle_del_category = async(id) => {
        try {
            const curRes = await actLIBRARY_DEL_CATEGORY(id)
            enqueueSnackbar(`${curRes?.data?.message}`, { variant: 'success' })
        } catch (error) {
            enqueueSnackbar(`${error?.data?.detail?.[0]?.msg || error?.data?.message }`, { variant: 'error' })
        } 
    }

    // init DT article management
    const dt_articles_management = [
        {id: 'code', label: 'Document Code'},
        {id: 'title', label: 'Article Title'},
        {
            id: 'category',
            label: 'category',
            getValues: (row) => row?.categories?.name,
            render: (row) => row?.categories?.name
        },
        {
            id: 'fileType',
            label: 'File Type',
            getValues: (row) => row?.files?.[0]?.file_extension,
            render: (row) => row?.files?.[0]?.file_extension
        },
        {
            id: 'author',
            label: 'Created By',
            getValue: (row) => row?.author?.name,
            render: (row) => row?.author?.name,
        },
        {
            id: 'created_at',
            label: 'Created At',
            getValue: (row) => row?.created_at ? new Date(row.created_at).getTime() : 0,
            render: (row) => moment(row?.created_at).format('DD MMM yyy'),
        },
        {
            id: 'active',
            label: 'Active',
            align: 'center',
            sortable: false,
            render: (row) => (
                <Checkbox
                    checked={row?.statuses?.name === 'Active'}
                    onClick={() => handleActivePosts(row)}
                />
            ),
        },

    ]

    // init DT to list categories
    const dt_add_categories = [
        {id: 'name', label: 'Category Name'},
        {
            id: 'action',
            label: 'Action',
            align: 'center',
            sortable: false,
            render: (row) => (
                <Button onClick={() => handle_del_category(row.id)} color="error" startIcon={<DeleteIcon />} />
            ),
        },
    ]

    const handleActivePosts = async (row) => {
        const currActive = row?.statuses?.name === 'Active'
        const message = currActive ? 'Are you sure you want to set di Article to Non Active ?' : 'Are you sure you want to set di Article to Active ?'
        const y = await confirm('Change Status', message)
        if (y) {
            setArticleStatuses(row)
        }
    }

    const setArticleStatuses = async (row) => {
        const currStatuses = row?.statuses?.name === 'Active'
        const formData = new FormData()
        formData.append('title', row?.title)
        formData.append('content', row?.content)
        formData.append('status_id', currStatuses ? 1 : 2)
        formData.append('category_id', row.categories?.id)
        formData.append('author_id', row?.author?.id)
        formData.append('visibility_id', row?.visibility?.id)
        formData.append('effective_date', row?.effective_date)

        try {
            setSubmitting(true)
            const res = await actLIBRARY_UPDATE_MY_DOC({ payload: row, formData })
            enqueueSnackbar(`${res?.data?.message}`, { variant: 'success' })
            mutLIBRARY_UPDATE_MY_DOC(res?.data?.data) // hit mutate nya untuk replace item yg baru di update, jadi biar irit network aje sih.
            // navigate('/mydocument')
        } catch (error) {
            enqueueSnackbar(`${error?.data?.detail?.[0]?.msg} Error`, { variant: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Grid container spacing={1} sx={{justifyContent: 'center'}}>
            <FullScreenLoading open={submitting} message={'Updating Article'} />
            <Grid size={{xs: 12, md:12, xl:10}} sx={{display: 'flex', flexDirection: 'column', marginTop:4, gap:2}}>
                <h1>Article Management</h1>
                <Divider />

                <Box sx={{display: 'flex', flexDirection:{xs:'column', md:'row'}, justifyContent: 'space-between', alignItems:{xs:'stretch', md:'flex-start'}, gap:2, minWidth:0}}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', minWidth:0 }}>
                        <TextField
                            label="Search (code / title)"
                            size="small"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ minWidth:{xs:'100%', sm:180}, flex: {sm: '1 1 140px'} }}
                        />
                        <Grow in={true}>
                            <Autocomplete
                                size="small"
                                options={users || []}
                                getOptionLabel={(option) => option?.name || ''}
                                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                                value={users?.find((u) => u.id === selectedUser) || null}
                                onChange={(event, newValue) => setSelectedUser(newValue?.id || '')}
                                renderInput={(params) => <TextField {...params} label="Created By" />}
                                slotProps={{
                                    listbox: { sx: { maxHeight: 200 }},
                                    popper: {component: AnimatedPopper}
                                }}
                                sx={{ minWidth:{xs:'100%', sm:140}, flex: {sm: '1 1 140px'} }}
                            />
                        </Grow>

                        <Autocomplete
                            size="small"
                            options={toCategory || []}
                            getOptionLabel={(option) => option?.name || ''}
                            isOptionEqualToValue={(option, value) => option?.id === value?.id}
                            value={toCategory?.find((c) => c.id === selectedCategory) || null}
                            onChange={(event, newValue) => setSelectedCategory(newValue?.id || '')}
                            renderInput={(params) => <TextField {...params} label="Category" />}
                            slotProps={{
                                listbox: { sx: { maxHeight: 200 }},
                                popper: {component: AnimatedPopper}
                            }}
                            sx={{ minWidth:{xs:'100%', sm:140}, flex: {sm: '1 1 140px'} }}
                        />

                        <DatePicker
                            slotProps={{
                                textField: {
                                    size: 'small',
                                    readOnly: false,
                                    onClick: () => setDatepicker(true)
                                },
                                field: {
                                    clearable: true,
                                    onClear: () => setSelectedDate(null)
                                }
                            }}
                            open={datepickerOpen}
                            onOpen={() => setDatepicker(true)}
                            onClose={()=>setDatepicker(false)}
                            label="Date Upload"
                            value={selectedDate}
                            onChange={(newVal) => setSelectedDate(newVal)}
                        />

                    </Box>
                    <Box sx={{display: 'flex'}}>
                        <Button variant="contained" onClick={handleAddCatDialog} startIcon={<AddIcon />}>
                            add category
                        </Button>
                    </Box>
                </Box>
                <DataTable columns={dt_articles_management} data={filteredArticles} rowKey={(row) => row.id} defaultOrderBy="code" />
                {ConfirmDialog}
            </Grid>
            <Dialog open={!!is_categories_dialog}  maxWidth="sm" fullWidth scroll="paper">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" component="span" noWrap sx={{ pr: 2 }}>
                        List of categories
                    </Typography>
                    <IconButton size="small" onClick={closedRefDialog}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{display: 'flex', gap: 2}}>
                        <TextField inputRef={category_input} size="small" fullWidth label="Add New Category" onChange={(e) => set_toCategory(e.target.value)}></TextField>
                        <Button onClick={handle_addCategory} variant="contained" disabled={!to_category_submit}>Submit</Button>
                    </Box>

                    <Box sx={{display: 'flex', flexDirection: 'column'}}>
                        <DataTable columns={dt_add_categories} data={toCategory} rowKey={(row) => row.id} defaultOrderBy="name" />
                    </Box>
                </DialogContent>
            </Dialog>
        </Grid>
    )
}

export default ArticleManagement