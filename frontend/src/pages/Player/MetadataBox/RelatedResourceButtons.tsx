import {
	IconProps,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidSparkles,
	Stack,
	Tag,
} from '@highlight-run/ui/components'
import moment from 'moment'
import { createSearchParams, Link } from 'react-router-dom'

import { useRelatedResource } from '@/components/RelatedResources/hooks'
import { useProjectId } from '@/hooks/useProjectId'
import analytics from '@/util/analytics'

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
	const { set } = useRelatedResource()
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
	const tracesLink = getTracesLink({
		projectId,
		secureSessionId,
		startDate,
		endDate,
	})

	return (
		<Stack gap="4" direction="row">
			<ResourceLink
				to={errorLink}
				disabled={errorLinkDisabled}
				trackingId="session_related-resource-errors_click"
				icon={<IconSolidLightningBolt size={11} />}
			>
				View errors
			</ResourceLink>
			<ResourceTag
				onClick={() => {
					set({
						type: 'logs',
						query: `secure_session_id=${secureSessionId}`,
						startDate: moment(startDate)
							.subtract(5, 'minutes')
							.toISOString(),
						endDate: moment(endDate)
							.add(5, 'minutes')
							.toISOString(),
					})

					analytics.track('session_related-resource-logs_click')
				}}
				disabled={logsLinkDisabled}
				icon={<IconSolidLogs size={11} />}
			>
				View logs
			</ResourceTag>
			<ResourceLink
				to={tracesLink}
				disabled={tracesLinkDisabled}
				trackingId="session_related-resource-traces_click"
				icon={<IconSolidSparkles size={11} />}
			>
				View traces
			</ResourceLink>
		</Stack>
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
		query: `secure_session_id=${secureSessionId}`,
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

const ResourceLink: React.FC<
	React.PropsWithChildren<{
		to: string
		disabled: boolean
		trackingId: string
		icon: React.ReactElement<IconProps>
	}>
> = ({ to, disabled, icon, trackingId, children }) => {
	return disabled ? (
		<ResourceTag disabled icon={icon}>
			{children}
		</ResourceTag>
	) : (
		<Link to={to} onClick={() => analytics.track(trackingId)}>
			<ResourceTag disabled={false} icon={icon}>
				{children}
			</ResourceTag>
		</Link>
	)
}

const ResourceTag: React.FC<
	React.PropsWithChildren<{
		disabled: boolean
		icon: React.ReactElement<IconProps>
		onClick?: () => void
	}>
> = ({ disabled, icon, onClick, children }) => (
	<Tag
		kind="secondary"
		emphasis="medium"
		size="medium"
		shape="basic"
		disabled={disabled}
		icon={icon}
		onClick={onClick}
	>
		{children}
	</Tag>
)
