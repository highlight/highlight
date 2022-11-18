import { BaseSearchContext } from '@context/BaseSearchContext'
import { ErrorSearchParamsInput } from '@graph/schemas'
import { createContext } from '@util/context/context'

type ErrorSearchContext = BaseSearchContext<ErrorSearchParamsInput> & {
	update: () => void
}

export const [useErrorSearchContext, ErrorSearchContextProvider] =
	createContext<ErrorSearchContext>('ErrorSearchContext')
