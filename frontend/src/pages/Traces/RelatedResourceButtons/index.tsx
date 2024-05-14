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

import { useRelatedResource } from '@/components/RelatedResources/hooks'
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
	const { set } = useRelatedResource()
	const errorLinkDisabled = !traceId || disableErrors
	const sessionLinkDisabled = !traceId || !secureSessionId
	const logsLinkDisabled = !traceId

	const errorLink = getErrorsLink({ projectId, traceId, startDate, endDate })

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
					if (!secureSessionId) {
						return
					}

					set({
						type: 'session',
						secureId: secureSessionId,
					})

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
					set({
						type: 'logs',
						query: `trace_id=${traceId}`,
						startDate: moment(startDate)
							.subtract(5, 'minutes')
							.toISOString(),
						endDate: moment(endDate)
							.add(5, 'minutes')
							.toISOString(),
					})

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
		query: `trace_id=${traceId}`,
		start_date: moment(startDate).subtract(5, 'minutes').toISOString(),
		end_date: moment(endDate).add(5, 'minutes').toISOString(),
	})

	return `/${projectId}/errors?${params}`
}
