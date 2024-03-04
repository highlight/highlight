import {
	Attribute,
	ATTRIBUTES,
	CommandBarSearch,
} from '@components/CommandBar/context'
import {
	DEFAULT_TIME_PRESETS,
	FormState,
	presetValue,
} from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import {
	BuilderParams,
	buildQueryStateString,
	buildQueryURLString,
} from '@util/url/params'
import { useNavigate } from 'react-router-dom'

import {
	ERROR_FIELD_TYPE,
	ERROR_TYPE,
	SESSION_TYPE,
} from '@/components/QueryBuilder/QueryBuilder'
import { useErrorSearchContext } from '@/pages/Errors/ErrorSearchContext/ErrorSearchContext'
import { useSearchContext } from '@/pages/Sessions/SearchContext/SearchContext'

export const isErrorAttribute = (attribute: typeof ATTRIBUTES[number]) => {
	return [ERROR_TYPE, ERROR_FIELD_TYPE].includes(attribute.type)
}

export const isSessionAttribute = (attribute: typeof ATTRIBUTES[number]) => {
	return ['user', SESSION_TYPE].includes(attribute.type)
}

export const buildQueryBuilderParams = ({
	attribute,
	query,
	op = 'contains',
}: {
	attribute: Attribute
	query: string
	op?: string
}): BuilderParams => {
	return {
		[`${attribute.type}_${attribute.name}`]: `${op}:${query}`,
	}
}

export function nextAttribute(
	currentAttribute: Attribute | undefined,
	direction: 'next' | 'prev' = 'next',
) {
	const index = currentAttribute ? ATTRIBUTES.indexOf(currentAttribute) : -1
	if (index === -1) {
		if (direction === 'next') {
			return ATTRIBUTES[0]
		} else {
			return ATTRIBUTES[ATTRIBUTES.length - 1]
		}
	}

	if (direction === 'next') {
		return ATTRIBUTES[index + 1] ?? ATTRIBUTES[ATTRIBUTES.length - 1]
	} else {
		return ATTRIBUTES[index - 1] ?? ATTRIBUTES[0]
	}
}

const findSelectedPreset = (value?: string) => {
	if (!value) return undefined

	return DEFAULT_TIME_PRESETS.find((preset) => presetValue(preset) === value)
}

const buildTimeParams = (
	startDate?: Date,
	endDate?: Date,
	selectedPreset?: string,
) => {
	if (selectedPreset) {
		return `&relative_time=${selectedPreset}`
	} else if (startDate && endDate) {
		return `&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
	}

	return ''
}

type TimeRangeParams = {
	startDate: Date
	endDate: Date
	selectedPreset?: string
}

export const useAttributeSearch = (form: FormState<CommandBarSearch>) => {
	const query = form.getValue(form.names.search).trim()

	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const { commandBarDialog } = useGlobalContext()
	const { createNewSearch } = useSearchContext()
	const { createNewSearch: createNewErrorSearch } = useErrorSearchContext()
	return (
		attribute: Attribute | undefined,
		params?: { newTab?: boolean; timeRange?: TimeRangeParams },
	) => {
		if (!attribute) return

		const isError = isErrorAttribute(attribute)

		const basePath = `/${projectId}/${isError ? 'errors' : 'sessions'}`
		const qbParams = buildQueryBuilderParams({ attribute, query })

		const timeParams = buildTimeParams(
			params?.timeRange?.startDate,
			params?.timeRange?.endDate,
			params?.timeRange?.selectedPreset,
		)

		const selectedPreset = findSelectedPreset(
			params?.timeRange?.selectedPreset,
		)

		if (!params?.newTab) {
			if (isError) {
				createNewErrorSearch(
					buildQueryStateString(qbParams),
					params?.timeRange?.startDate,
					params?.timeRange?.endDate,
					selectedPreset,
				)
			} else {
				createNewSearch(
					buildQueryStateString(qbParams),
					params?.timeRange?.startDate,
					params?.timeRange?.endDate,
					selectedPreset,
				)
			}
			navigate({
				pathname: basePath,
				search: `${buildQueryURLString(qbParams)}${timeParams}`,
			})
		} else {
			const searchQuery = buildQueryURLString(qbParams)
			window.open(`${basePath}${searchQuery}${timeParams}`, '_blank')
		}
		commandBarDialog.hide()
	}
}
