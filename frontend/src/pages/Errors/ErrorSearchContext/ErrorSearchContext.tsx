import { BaseSearchContext } from '@context/BaseSearchContext'
import { ErrorSearchParamsInput } from '@graph/schemas'
import { createContext } from '@util/context/context'

type ErrorSearchContext = BaseSearchContext<ErrorSearchParamsInput> & {
	searchResultSecureIds: string[]
	setSearchResultSecureIds: React.Dispatch<React.SetStateAction<string[]>>
}

export const [useErrorSearchContext, ErrorSearchContextProvider] =
	createContext<ErrorSearchContext>('ErrorSearchContext')
