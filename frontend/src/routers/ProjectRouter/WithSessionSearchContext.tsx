import { SearchContextProvider } from '@pages/Sessions/SearchContext/SearchContext'

import { useGetBaseSearchContext } from '@/context/SearchState'
import { EmptySessionsSearchQuery } from '@/pages/Sessions/EmptySessionsSearchParams'
import {
	CUSTOM_FIELDS,
	TIME_RANGE_FIELD,
} from '@/pages/Sessions/SessionsFeedV3/SessionQueryBuilder/SessionQueryBuilder'

const WithSessionSearchContext: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const baseContext = useGetBaseSearchContext(
		EmptySessionsSearchQuery,
		'highlightSegmentPickerForPlayerSelectedSegmentId',
		CUSTOM_FIELDS,
		TIME_RANGE_FIELD,
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
