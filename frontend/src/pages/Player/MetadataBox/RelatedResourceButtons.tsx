import {
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidSparkles,
} from '@highlight-run/ui/components'
import moment from 'moment'
import { createSearchParams } from 'react-router-dom'

import { TagGroup } from '@/components/TagGroup'
import { useProjectId } from '@/hooks/useProjectId'

type Props = {
	secureSessionId?: string
	startDate: Date
	endDate: Date
	disableErrors: boolean
}

export const RelatedResourceButtons: React.FC<Props> = ({
	secureSessionId,
	startDate,
	endDate,
	disableErrors,
}) => {
	const { projectId } = useProjectId()
	const errorLinkDisabled = !secureSessionId || disableErrors
	const logsLinkDisabled = !secureSessionId
	const tracesLinkDisabled = !secureSessionId

	const errorLink = getErrorsLink({
		projectId,
		secureSessionId,
		startDate,
		endDate,
	})
	const logsLink = getLogsLink({
		projectId,
		secureSessionId,
		startDate,
		endDate,
	})
	const tracesLink = getTracesLink({
		projectId,
		secureSessionId,
		startDate,
		endDate,
	})

	return (
		<TagGroup
			tagLinks={[
				{
					key: 'errors',
					href: errorLink,
					disabled: errorLinkDisabled,
					icon: <IconSolidLightningBolt />,
					label: 'View errors',
				},
				{
					key: 'logs',
					href: logsLink,
					disabled: logsLinkDisabled,
					icon: <IconSolidLogs />,
					label: 'View logs',
				},
				{
					key: 'traces',
					href: tracesLink,
					disabled: tracesLinkDisabled,
					icon: <IconSolidSparkles />,
					label: 'View traces',
				},
			]}
		/>
	)
}

type LinkProps = {
	projectId: string
	startDate: Date
	endDate: Date
	secureSessionId?: string
}

const getErrorsLink = ({
	projectId,
	secureSessionId,
	startDate,
	endDate,
}: LinkProps) => {
	if (!secureSessionId) return ''

	const params = createSearchParams({
		query: `and||error-field_secure_session_id,is,${secureSessionId}`,
		start_date: moment(startDate).subtract(5, 'minutes').toISOString(),
		end_date: moment(endDate).add(5, 'minutes').toISOString(),
	})

	return `/${projectId}/errors?${params}`
}

const getTracesLink = ({
	projectId,
	secureSessionId,
	startDate,
	endDate,
}: LinkProps) => {
	if (!secureSessionId) return ''

	const params = createSearchParams({
		query: `secure_session_id=${secureSessionId}`,
		start_date: moment(startDate).subtract(5, 'minutes').toISOString(),
		end_date: moment(endDate).add(5, 'minutes').toISOString(),
	})

	return `/${projectId}/traces?${params}`
}

const getLogsLink = ({
	projectId,
	secureSessionId,
	startDate,
	endDate,
}: LinkProps) => {
	if (!secureSessionId) return ''

	const params = createSearchParams({
		query: `secure_session_id=${secureSessionId}`,
		start_date: moment(startDate).subtract(5, 'minutes').toISOString(),
		end_date: moment(endDate).add(5, 'minutes').toISOString(),
	})

	return `/${projectId}/logs?${params}`
}
