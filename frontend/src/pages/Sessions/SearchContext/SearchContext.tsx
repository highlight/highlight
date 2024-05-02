import { BaseSearchContext } from '@context/BaseSearchContext'
import { createContext } from '@util/context/context'

type SearchContext = BaseSearchContext

export const [useSearchContext, SearchContextProvider] =
	createContext<SearchContext>('SearchContext')
