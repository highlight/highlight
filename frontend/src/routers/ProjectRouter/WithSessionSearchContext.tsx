import { SearchContextProvider } from '@pages/Sessions/SearchContext/SearchContext'

import { useGetBaseSearchContext } from '@/context/SearchState'
import { EmptySessionsSearchQuery } from '@/pages/Sessions/EmptySessionsSearchParams'

const WithSessionSearchContext: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const baseContext = useGetBaseSearchContext(
		EmptySessionsSearchQuery,
		'highlightSegmentPickerForPlayerSelectedSegmentId',
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
