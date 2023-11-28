import {
	Attribute,
	ATTRIBUTES,
	CommandBarSearch,
} from '@components/CommandBar/context'
import { FormState } from '@highlight-run/ui/components'
import { useProjectId } from '@hooks/useProjectId'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import {
	BuilderParams,
	buildQueryStateString,
	buildQueryURLString,
} from '@util/url/params'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

import {
	CUSTOM_TYPE,
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
	startDate,
	endDate,
	query,
	op = 'contains',
}: {
	attribute: Attribute
	query: string
	startDate?: Date
	endDate?: Date
	op?: string
}): BuilderParams => {
	const result = {
		[`${attribute.type}_${attribute.name}`]: `${op}:${query}`,
	}
	if (startDate && endDate) {
		const timeFilter = isErrorAttribute(attribute)
			? `${ERROR_FIELD_TYPE}_timestamp`
			: `${CUSTOM_TYPE}_created_at`
		const start = moment(startDate).toISOString()
		const end = moment(endDate).toISOString()
		result[timeFilter] = `between_date:${start}_${end}`
	}
	return result
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

export const useAttributeSearch = (form: FormState<CommandBarSearch>) => {
	const query = form.getValue(form.names.search).trim()
	const dates = form.getValue(form.names.selectedDates)

	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const { commandBarDialog } = useGlobalContext()
	const { setSearchQuery } = useSearchContext()
	const { setSearchQuery: setErrorSearchQuery } = useErrorSearchContext()
	return (
		attribute: Attribute | undefined,
		params?: { newTab?: boolean; withDate?: boolean },
	) => {
		if (!attribute) return

		const isError = isErrorAttribute(attribute)

		const basePath = `/${projectId}/${isError ? 'errors' : 'sessions'}`
		const qbParams = buildQueryBuilderParams({
			attribute,
			query,
			startDate: params?.withDate ? dates[0] : undefined,
			endDate: params?.withDate ? dates[1] : undefined,
		})

		if (!params?.newTab) {
			if (isError) {
				setErrorSearchQuery(buildQueryStateString(qbParams))
			} else {
				setSearchQuery(buildQueryStateString(qbParams))
			}
			navigate({
				pathname: basePath,
			})
		} else {
			const searchQuery = buildQueryURLString(qbParams)
			window.open(`${basePath}${searchQuery}`, '_blank')
		}
		commandBarDialog.hide()
	}
}
