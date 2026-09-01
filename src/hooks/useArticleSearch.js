import { useState, useMemo } from 'react'
import elibraryMasterHooks from './useLibraryMaster'

function useArticleSearch(articles = [], filters = {}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')

    // fetch ke api category langsung bae
    const { getCategories: categoryOptions } = elibraryMasterHooks({
        getUsers: false,
        getCategories: true,
        getVisibility: false,
        getStatuses: false,
    })

    const filteredArticles = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase()

        const results = articles.filter((article) => {
            const matchCategory =
                selectedCategory === 'all' ||
                String(article?.categories?.id) === String(selectedCategory)

            const matchBookmark = !filters.bookmark || article?.bookmark === true
            const matchDate = !filters.date || article?.created_at?.slice(0, 10) === filters.date
            const matchAuthor = !filters.author || article?.author?.name === filters.author

            if (!matchCategory || !matchBookmark || !matchDate || !matchAuthor) return false
            if (!keyword) return true

            const title = article?.title?.toLowerCase() || ''
            const code = article?.code?.toLowerCase() || ''

            return title.includes(keyword) || code.includes(keyword)
        })

        return filters.popular
            ? [...results].sort((a, b) => (b?.analytics?.views ?? 0) - (a?.analytics?.views ?? 0))
            : results
    }, [articles, searchTerm, selectedCategory, filters.bookmark, filters.date, filters.author, filters.popular])

    const resetSearch = () => {
        setSearchTerm('')
        setSelectedCategory('all')
    }

    return {
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        categoryOptions,
        filteredArticles,
        resetSearch,
    }
}

export default useArticleSearch
