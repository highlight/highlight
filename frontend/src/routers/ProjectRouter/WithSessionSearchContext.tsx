import { SearchContextProvider } from '@pages/Sessions/SearchContext/SearchContext'

import { useGetBaseSearchContext } from '@/context/SearchState'
import { EmptySessionsSearchQuery } from '@/pages/Sessions/EmptySessionsSearchParams'
import { CUSTOM_FIELDS } from '@/pages/Sessions/SessionsFeedV3/SessionQueryBuilder/SessionQueryBuilder'

const WithSessionSearchContext: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const baseContext = useGetBaseSearchContext(
		'sessions',
		EmptySessionsSearchQuery,
		'highlightSegmentPickerForPlayerSelectedSegmentId',
		CUSTOM_FIELDS,
	)

	const sessionSearchContext = {
		...baseContext,
	}

	return (
		<SearchContextProvider value={sessionSearchContext}>
			{children}
		</SearchContextProvider>
	)
}

export default WithSessionSearchContext
