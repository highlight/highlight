import {
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
} from '@highlight-run/ui/components'
import moment from 'moment'
import { createSearchParams } from 'react-router-dom'

import { TagGroup } from '@/components/TagGroup'
import { useProjectId } from '@/hooks/useProjectId'

type Props = {
	traceId?: string
	secureSessionId?: string
	disableErrors: boolean
	displayErrorTooltip?: boolean
	startDate: Date
	endDate: Date
}

export const RelatedResourceButtons: React.FC<Props> = ({
	traceId,
	secureSessionId,
	disableErrors,
	displayErrorTooltip,
	startDate,
	endDate,
}) => {
	const { projectId } = useProjectId()
	const errorLinkDisabled = !traceId || disableErrors
	const sessionLinkDisabled = !traceId || !secureSessionId
	const logsLinkDisabled = !traceId

	const errorLink = getErrorsLink({ projectId, traceId, startDate, endDate })
	const sessionLink = getSessionLink({
		projectId,
		secureSessionId,
		startDate,
		endDate,
	})
	const logsLink = getLogsLink({ projectId, traceId, startDate, endDate })

	return (
		<TagGroup
			tagLinks={[
				{
					key: 'errors',
					href: errorLink,
					disabled: errorLinkDisabled,
					icon: <IconSolidLightningBolt />,
					label: 'View errors',
					tooltip: displayErrorTooltip
						? 'Some errors may be filtered out due to your ingestion filter settings or exceeding your billing quota. Please reach out with any questions.'
						: '',
				},
				{
					key: 'session',
					href: sessionLink,
					disabled: sessionLinkDisabled,
					icon: <IconSolidPlayCircle />,
					label: 'View session',
				},
				{
					key: 'logs',
					href: logsLink,
					disabled: logsLinkDisabled,
					icon: <IconSolidLogs />,
					label: 'View logs',
				},
			]}
		/>
	)
}

type LinkProps = {
	projectId: string
	startDate: Date
	endDate: Date
	traceId?: string
	secureSessionId?: string
}

const getErrorsLink = ({
	projectId,
	traceId,
	startDate,
	endDate,
}: LinkProps) => {
	if (!traceId) return ''

	const params = createSearchParams({
		query: `and||error-field_trace_id,is,${traceId}`,
		start_date: moment(startDate).subtract(5, 'minutes').toISOString(),
		end_date: moment(endDate).add(5, 'minutes').toISOString(),
	})

	return `/${projectId}/errors?${params}`
}

const getSessionLink = ({
	projectId,
	secureSessionId,
	startDate,
}: LinkProps) => {
	if (!secureSessionId) return ''

	const params = createSearchParams({
		tsAbs: startDate.toISOString(),
	})

	return `/${projectId}/sessions/${secureSessionId}?${params}`
}

const getLogsLink = ({ projectId, traceId, startDate, endDate }: LinkProps) => {
	const params = createSearchParams({
		query: `trace_id=${traceId}`,
		start_date: moment(startDate).subtract(5, 'minutes').toISOString(),
		end_date: moment(endDate).add(5, 'minutes').toISOString(),
	})

	return `/${projectId}/logs?${params}`
}
