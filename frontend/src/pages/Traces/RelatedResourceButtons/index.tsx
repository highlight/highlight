import {
	Box,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	Tag,
} from '@highlight-run/ui/components'
import moment from 'moment'
import { createSearchParams } from 'react-router-dom'

import { Link } from '@/components/Link'
import { useProjectId } from '@/hooks/useProjectId'

import * as styles from './style.css'

const TAG_PROPS = {
	size: 'medium',
	kind: 'secondary',
	emphasis: 'medium',
} as const

type Props = {
	traceId?: string
	secureSessionId?: string
	disableErrors: boolean
	startDate: Date
	endDate: Date
}

const getErrorsLink = (
	projectId: string,
	traceId: string,
	startDate: Date,
	endDate: Date,
) => {
	const params = createSearchParams({
		query: `and||error-field_trace_id,is,${traceId}`,
		start_date: moment(startDate).subtract(5, 'minutes').toISOString(),
		end_date: moment(endDate).add(5, 'minutes').toISOString(),
	})

	return `/${projectId}/errors?${params}`
}

const getSessionLink = (
	projectId: string,
	secureSessionId: string,
	startDate: Date,
) => {
	const params = createSearchParams({
		tsAbs: startDate.toISOString(),
	})

	return `/${projectId}/sessions/${secureSessionId}?${params}`
}

const getLogsLink = (
	projectId: string,
	traceId: string,
	startDate: Date,
	endDate: Date,
) => {
	const params = createSearchParams({
		query: `trace_id=${traceId}`,
		start_date: moment(startDate).subtract(5, 'minutes').toISOString(),
		end_date: moment(endDate).add(5, 'minutes').toISOString(),
	})

	return `/${projectId}/logs?${params}`
}

export const RelatedResourceButtons: React.FC<Props> = ({
	traceId,
	secureSessionId,
	disableErrors,
	startDate,
	endDate,
}) => {
	const { projectId } = useProjectId()
	const errorLinkDisabled = !traceId || disableErrors
	const sessionLinkDisabled = !traceId || !secureSessionId
	const logsLinkDisabled = !traceId

	const errorLink = errorLinkDisabled
		? ''
		: getErrorsLink(projectId, traceId, startDate, endDate)
	const sessionLink = sessionLinkDisabled
		? ''
		: getSessionLink(projectId, secureSessionId, startDate)

	const logsLink = logsLinkDisabled
		? ''
		: getLogsLink(projectId, traceId, startDate, endDate)

	return (
		<Box>
			<Link to={errorLink} className={styles.tagLink} reloadDocument>
				<Tag
					{...TAG_PROPS}
					shape="leftBasic"
					iconLeft={<IconSolidLightningBolt />}
					disabled={errorLinkDisabled}
				>
					View errors
				</Tag>
			</Link>
			<Link to={sessionLink} className={styles.tagLink}>
				<Tag
					{...TAG_PROPS}
					shape="square"
					iconLeft={<IconSolidPlayCircle />}
					disabled={sessionLinkDisabled}
				>
					View session
				</Tag>
			</Link>
			<Link to={logsLink} className={styles.tagLink}>
				<Tag
					{...TAG_PROPS}
					shape="rightBasic"
					iconLeft={<IconSolidLogs />}
					disabled={logsLinkDisabled}
				>
					View logs
				</Tag>
			</Link>
		</Box>
	)
}
