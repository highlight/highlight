import { createContext } from '@util/context/context'

type SearchContext = {
	query: string
	setQuery: (query: string) => void
	onSubmit: (query: string) => void
}

export const [useSearchContext, SearchContextProvider] =
	createContext<SearchContext>('SearchContext')
