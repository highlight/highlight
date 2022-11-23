import { ErrorGroup, Maybe, Project } from '@graph/schemas'

export const getProjectPrefix = (project?: Maybe<Pick<Project, 'name'>>) =>
	project?.name.slice(0, 3).toUpperCase() || 'HIG'

export const getErrorGroupStats = function (errorGroup: Maybe<ErrorGroup>) {
	const counts = errorGroup?.error_metrics
		?.filter((x) => x?.name === 'count')
		?.map((x) => x?.value || 0)
	const totalCount = counts?.reduce((a, b) => a + b, 0)
	const userCount = errorGroup?.error_metrics
		?.filter((x) => x?.name === 'identifierCount')
		?.map((x) => x?.value || 0)
		?.reduce((a, b) => a + b, 0)
	return {
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
