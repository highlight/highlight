import {
	Attribute,
	ATTRIBUTES,
	CommandBarSearch,
} from '@components/CommandBar/context'
import { useProjectId } from '@hooks/useProjectId'
import {
	ERROR_FIELD_TYPE,
	ERROR_TYPE,
} from '@pages/ErrorsV2/ErrorQueryBuilder/ErrorQueryBuilder'
import {
	CUSTOM_TYPE,
	SESSION_TYPE,
} from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/SessionQueryBuilder'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import { BuilderParams, buildQueryURLString } from '@util/url/params'
import { FormState } from 'ariakit/form'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

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
	const query = form.getValue(form.names.search)
	const dates = form.getValue(form.names.selectedDates)

	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const { commandBarDialog } = useGlobalContext()
	return (
		attribute: Attribute | undefined,
		params?: { newTab?: boolean; withDate?: boolean },
	) => {
		if (!attribute) return

		const basePath = `/${projectId}/${
			isErrorAttribute(attribute) ? 'errors' : 'sessions'
		}`
		const qbParams = buildQueryBuilderParams({
			attribute,
			query,
			startDate: params?.withDate ? dates[0] : undefined,
			endDate: params?.withDate ? dates[1] : undefined,
		})

		const searchQuery = buildQueryURLString(qbParams, {
			reload: true,
		})

		if (!params?.newTab) {
			navigate({
				pathname: basePath,
				search: searchQuery,
			})
		} else {
			window.open(`${basePath}${searchQuery}`, '_blank')
		}
		commandBarDialog.hide()
	}
}
