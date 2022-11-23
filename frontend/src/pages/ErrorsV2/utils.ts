import { ErrorGroup, Maybe, Project } from '@graph/schemas'
import moment from 'moment/moment'

export const getProjectPrefix = (project?: Maybe<Pick<Project, 'name'>>) =>
	project?.name.slice(0, 3).toUpperCase() || 'HIG'

export const getErrorGroupStats = function (errorGroup: Maybe<ErrorGroup>) {
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
	for (let i = 0; i < 4; i++) {
		const weekCounts = errorGroup?.error_metrics.slice(i * 7, (i + 1) * 7)
		weekly.count.push(
			weekCounts
				?.filter((x) => x?.name === 'count')
				?.reduce((a, b) => a + b.value, 0) || 0,
		)
		weekly.users.push(
			weekCounts
				?.filter((x) => x?.name === 'identifierCount')
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
