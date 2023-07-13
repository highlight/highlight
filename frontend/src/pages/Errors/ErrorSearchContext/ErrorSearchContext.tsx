import { BaseSearchContext } from '@context/BaseSearchContext'
import { createContext } from '@util/context/context'

type ErrorSearchContext = BaseSearchContext & {
	searchResultSecureIds: string[]
	setSearchResultSecureIds: React.Dispatch<React.SetStateAction<string[]>>
}

export const [useErrorSearchContext, ErrorSearchContextProvider] =
	createContext<ErrorSearchContext>('ErrorSearchContext')
