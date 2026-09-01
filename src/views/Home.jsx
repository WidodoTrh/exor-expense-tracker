import { Box, Container } from "@mui/material";
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { flushSync } from 'react-dom'
import global from "../appcore/global"
import elibraryMasterHooks from '../hooks/useLibraryMaster'
import ArticleSearchBar from '../component/ArticleSearchBar'

function Home() {
    const homeImage = global.ftpServe('/elibrary/Foto/home-lib-pict.png');
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    const {getCategories: categoryOptions} = elibraryMasterHooks({ getUsers: false, getCategories: true, getVisibility: false, getStatuses: false,})

    const handleSubmit = (value) => {
        const keyword = value.trim()

        const params = new URLSearchParams()
        if (keyword) params.set('search', keyword)
        if (selectedCategory !== 'all') params.set('category', selectedCategory)
        if (!keyword && selectedCategory === 'all') return
        navigate(`/library?${params.toString()}`)
    }

     const handleCategoryClick = (categoryId) => {
        flushSync(() => {
            setSelectedCategory(categoryId)
        })
        navigate(`/library?category=${encodeURIComponent(categoryId)}`)
    }

    return (
        <Container maxWidth="lg" sx={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            <Box sx={{ display:'flex', flexDirection:'row', bgcolor:'', gap:2, flexGrow: 1, alignItems: 'center'}}>
                <img src={homeImage} alt="" style={{ maxWidth: '100%', height:'auto', objectFit: 'contain'}} />
                <Box sx={{ display: 'flex', flexDirection: 'column', flex:1, alignItems:'start', justifyContent:'center', gap:2, minWidth: 0}}>
                    <h1 style={{ margin:0 }} >Selamat Datang di E-Library</h1>
                    <h5 style={{ margin:0 }} >Satu portal untuk semua</h5>
                    <ArticleSearchBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedCategory={selectedCategory}
                        categoryOptions={categoryOptions}
                        onCategoryChange={handleCategoryClick}
                        onSubmit={handleSubmit}
                    />
                </Box>
            </Box>
        </Container>
    )
}

export default Home