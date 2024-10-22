import { PAGE_SIZE } from '@components/SearchPagination/SearchPagination'
import { useGetErrorObjectsQuery } from '@graph/hooks'
import moment from 'moment'

import { TIME_FORMAT } from '@/components/Search/SearchForm/constants'

export const useGetErrorObjects = ({
	query,
	project_id,
	startDate,
	endDate,
	page = 1,
}: {
	query: string
	project_id: string | undefined
	startDate: Date
	endDate: Date
	page?: number
}) => {
	const { data, loading, error, refetch } = useGetErrorObjectsQuery({
		variables: {
			project_id: project_id!,
			count: PAGE_SIZE,
			page,
			params: {
				query,
				date_range: {
					start_date: moment(startDate).format(TIME_FORMAT),
					end_date: moment(endDate).format(TIME_FORMAT),
				},
			},
		},
		fetchPolicy: 'cache-and-network',
	})

	return {
		errorObjects: data?.error_objects.error_objects || [],
		loading,
		error,
		refetch,
		totalCount: data?.error_objects?.totalCount || 0,
	}
}
