import { ErrorSearchContextProvider } from '@pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { useState } from 'react'

import { useGetBaseSearchContext } from '@/context/SearchState'
import { EmptyErrorsSearchQuery } from '@/pages/Errors/ErrorsPage'
import { CUSTOM_FIELDS } from '@/pages/ErrorsV2/ErrorQueryBuilder/ErrorQueryBuilder'

const WithErrorSearchContext: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const baseContext = useGetBaseSearchContext(
		'errors',
		EmptyErrorsSearchQuery,
		'highlightSegmentPickerForErrorsSelectedSegmentId',
		CUSTOM_FIELDS,
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
