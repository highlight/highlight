import { ErrorGroup, Maybe, Project } from '@graph/schemas'
import moment from 'moment/moment'

export const getProjectPrefix = (project?: Maybe<Pick<Project, 'name'>>) =>
	project?.name.slice(0, 3).toUpperCase() || 'HIG'

export const getErrorGroupStats = function (
	errorGroup?: Maybe<Pick<ErrorGroup, 'error_metrics' | 'created_at'>>,
) {
	const lookbackDays = 30
	const counts = errorGroup?.error_metrics
		?.filter((x) => x?.name === 'count')
		?.map((x) => x?.value || 0)
	const totalCount = counts?.reduce((a, b) => a + b, 0)
	const userCount = errorGroup?.error_metrics
		?.filter((x) => x?.name === 'identifierCount')
		?.reduce((a, b) => a + b.value, 0)
	const weekly: { count: number[]; users: number[] } = {
		count: [],
		users: [],
	}
	for (let i = 0; i < 2; i++) {
		weekly.count.push(
			errorGroup?.error_metrics
				?.filter((x) => x?.name === 'count')
				?.slice(i * 7, (i + 1) * 14)
				?.reduce((a, b) => a + b.value, 0) || 0,
		)
		weekly.users.push(
			errorGroup?.error_metrics
				?.filter((x) => x?.name === 'identifierCount')
				?.slice(i * 7, (i + 1) * 14)
				?.reduce((a, b) => a + b.value, 0) || 0,
		)
	}
	return {
		startDate: moment.max(
			moment(errorGroup?.created_at),
			moment().subtract(lookbackDays, 'days'),
		),
		weekly,
		counts,
		totalCount,
		userCount,
	}
}

export const formatErrorGroupDate = function (date?: string) {
	return date
		? `${new Date(date).toLocaleString('en-us', {
				day: 'numeric',
				month: 'short',
				year:
					new Date().getFullYear() !== new Date(date).getFullYear()
						? 'numeric'
						: undefined,
		  })}`
		: ''
}
