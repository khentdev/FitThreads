import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export type SearchFilter = 'top' | 'recent' | 'profile'

export const useSearchState = () => {
    const route = useRoute()
    const router = useRouter()

    const searchInput = ref('')
    const searchQuery = ref('')
    const activeFilter = ref<SearchFilter>('top')
    const hasSearched = ref(false)

    watch(
        [() => route.query['q'], () => route.query['filter']],
        ([q, filter]) => {
            const queryStr = (q as string) || ''
            const filterStr = (filter as string) || 'top'

            searchInput.value = queryStr
            searchQuery.value = queryStr

            hasSearched.value = queryStr.trim().length > 0

            if (filterStr === 'profile') {
                activeFilter.value = 'profile'
            } else if (['recent', 'top'].includes(filterStr)) {
                activeFilter.value = filterStr as SearchFilter
            } else {
                activeFilter.value = 'top'
            }
        },
        { immediate: true }
    )

    const updateUrl = (newQuery: string, newFilter: SearchFilter) => {
        if (newQuery.trim().length === 0) {
            hasSearched.value = false
            router.replace({ path: route.path })
            return
        }

        const queryParams: Record<string, string> = { q: newQuery }

        if (newFilter !== 'top') {
            queryParams['filter'] = newFilter
        }

        router.replace({ query: queryParams })
    }

    const setSearch = (query: string) => {
        updateUrl(query, activeFilter.value)
    }

    const setFilter = (filter: SearchFilter) => {
        updateUrl(searchInput.value, filter)
    }

    return {
        searchInput,
        searchQuery,
        activeFilter,
        hasSearched,
        setSearch,
        setFilter
    }
}
