import { ErrorSearchContextProvider } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { useState } from 'react'

import { useGetBaseSearchContext } from '@/context/SearchState'
import { EmptyErrorsSearchQuery } from '@/pages/Errors/ErrorsPage'

const WithErrorSearchContext: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const baseContext = useGetBaseSearchContext(
		EmptyErrorsSearchQuery,
		'highlightSegmentPickerForErrorsSelectedSegmentId',
	)

	const [searchResultSecureIds, setSearchResultSecureIds] = useState<
		string[]
	>([])

	const errorSearchContext = {
		...baseContext,
		searchResultSecureIds,
		setSearchResultSecureIds,
	}

	return (
		<ErrorSearchContextProvider value={errorSearchContext}>
			{children}
		</ErrorSearchContextProvider>
	)
}

export default WithErrorSearchContext
