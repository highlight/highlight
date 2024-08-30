import { ErrorGroup, Maybe, Project } from '@graph/schemas'
import { cloneDeep } from 'lodash'

export const getProjectPrefix = (project?: Maybe<Pick<Project, 'name'>>) =>
	project?.name.slice(0, 3).toUpperCase() || 'HIG'

export const getErrorGroupStats = function (
	errorGroup?: Maybe<Pick<ErrorGroup, 'error_metrics' | 'created_at'>>,
) {
	const lookbackDays = 30
	let counts: number[] =
		errorGroup?.error_metrics
			?.filter((x) => x?.name === 'count')
			?.map((x) => x?.value || 0) || []
	if (counts.length < lookbackDays) {
		counts = [...Array(lookbackDays - counts.length).fill(0), ...counts]
	}

	// With clickhouse enabled, we're emitting new monthCount and monthIdentifierCount metrics.
	// If those are present, use them instead of aggregating the count / identifier count
	const monthCount = errorGroup?.error_metrics
		.filter((x) => x.name === 'monthCount')
		.reduce((a, b) => a + b.value, 0)

	const monthUserCount = errorGroup?.error_metrics
		.filter((x) => x.name === 'monthIdentifierCount')
		.reduce((a, b) => a + b.value, 0)

	const totalCount = monthCount || counts?.reduce((a, b) => a + b, 0) || 1
	const userCount =
		monthUserCount ||
		errorGroup?.error_metrics
			?.filter((x) => x?.name === 'identifierCount')
			?.reduce((a, b) => a + b.value, 0) ||
		1

	const weekly: { count: number[]; users: number[] } = {
		count: [],
		users: [],
	}

	// With clickhouse enabled, we're emitting new weekCount and weekIdentifierCount metrics.
	// If those are present, use them instead of aggregating the count / identifier count
	const weekCounts = errorGroup?.error_metrics
		.filter((x) => x.name === 'weekCount')
		.map((x) => x.value)

	const weekIdentifierCounts = errorGroup?.error_metrics
		.filter((x) => x.name === 'weekIdentifierCount')
		.map((x) => x.value)

	if (weekCounts?.length && weekIdentifierCounts?.length) {
		weekly.count = weekCounts
		weekly.users = weekIdentifierCounts
	} else {
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
	}

	return {
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

export const parseErrorDescription = (
	_text: Maybe<string>[] | undefined,
): string => {
	if (!_text) {
		return ''
	}

	return parseErrorDescriptionList(_text).join('')
}

export const parseErrorDescriptionList = (
	_text: Maybe<string>[] | undefined,
): string[] => {
	if (!_text) {
		return []
	}
	const text = cloneDeep(_text)
	const result: string[] = []
	let index = 0

	while (index < text.length) {
		let currentLine = text[index] as string
		if (!currentLine) {
			break
		}
		/**
		 * The specifier %s used to interpolate values in a console.(log|info|etc.) call.
		 * https://developer.mozilla.org/en-US/docs/Web/API/Console#Using_string_substitutions
		 */
		const specifierCount = (currentLine.match(/%s/g) || []).length
		if (specifierCount === 0) {
			result.push(currentLine)
			index++
		} else {
			let offset = 1
			while (offset <= specifierCount) {
				const nextToken = text[index + offset] as string
				currentLine = currentLine.replace('%s', nextToken)
				offset++
			}
			result.push(currentLine)
			index += specifierCount + 1
		}
	}

	return result
}

export const getHeaderFromError = (
	errorMsg: Maybe<string>[] | undefined,
): string => {
	const eventText = parseErrorDescriptionList(errorMsg)[0]
	let title = ''
	// Try to get the text in the form Text: ....
	const splitOnColon = eventText?.split(':') ?? []
	if (
		splitOnColon.length &&
		(!splitOnColon[0].includes(' ') ||
			splitOnColon[0].toLowerCase().includes('error'))
	) {
		return splitOnColon[0]
	}
	// Try to get text in the form "'Something' Error" in the event.
	const split = eventText?.split(' ') ?? []
	let prev = ''
	for (let i = 0; i < split?.length; i++) {
		const curr = split[i]
		if (curr.toLowerCase().includes('error')) {
			title = (prev ? prev + ' ' : '') + curr
			return title
		}
		prev = curr
	}

	return errorMsg?.join() ?? ''
}
