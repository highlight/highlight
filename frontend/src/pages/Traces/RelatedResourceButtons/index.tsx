import {
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import moment from 'moment'
import { createSearchParams, useNavigate } from 'react-router-dom'

import { useProjectId } from '@/hooks/useProjectId'
import analytics from '@/util/analytics'

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
	const navigate = useNavigate()
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
		<>
			<Tooltip
				disabled={!displayErrorTooltip}
				trigger={
					<Tag
						kind="secondary"
						onClick={() => {
							navigate(errorLink)
							analytics.track('trace_related-error-button_click')
						}}
						emphasis="medium"
						iconLeft={<IconSolidLightningBolt />}
						disabled={errorLinkDisabled}
						shape="basic"
					>
						View errors
					</Tag>
				}
			>
				<Text>
					Some errors may be filtered out due to your ingestion filter
					settings or exceeding your billing quota. Please reach out
					with any questions.
				</Text>
			</Tooltip>
			<Tag
				onClick={() => {
					navigate(sessionLink)
					analytics.track('trace_related-session-button_click')
				}}
				size="medium"
				kind="secondary"
				emphasis="medium"
				iconLeft={<IconSolidPlayCircle />}
				disabled={sessionLinkDisabled}
				shape="basic"
			>
				View session
			</Tag>
			<Tag
				onClick={() => {
					navigate(logsLink)
					analytics.track('trace_related-logs-button_click')
				}}
				size="medium"
				kind="secondary"
				emphasis="medium"
				iconLeft={<IconSolidLogs />}
				disabled={logsLinkDisabled}
				shape="basic"
			>
				View logs
			</Tag>
		</>
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
