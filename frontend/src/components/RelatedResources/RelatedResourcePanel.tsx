import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { ErrorPanel } from '@/components/RelatedResources/ErrorPanel'
import {
	RelatedResource,
	useRelatedResource,
} from '@/components/RelatedResources/hooks'
import { LogsPanel } from '@/components/RelatedResources/LogsPanel'
import { Panel } from '@/components/RelatedResources/Panel'
import { RelatedResourceList } from '@/components/RelatedResources/RelatedResourceList'
import { SessionPanel } from '@/components/RelatedResources/SessionPanel'
import { TracePanel } from '@/components/RelatedResources/TracePanel'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { TraceProvider } from '@/pages/Traces/TraceProvider'
import analytics from '@/util/analytics'

type Props = React.PropsWithChildren & {}
export type ResourcePanelProps = { resource: RelatedResource }

export const RelatedResourcePanel: React.FC<Props> = ({}) => {
	const { resource } = useRelatedResource()
	const { projectId } = useNumericProjectId()
	const location = useLocation()

	useEffect(() => {
		if (!resource) {
			return
		}

		analytics.track('related-resource-panel_view', {
			panelResourceType: resource.type.toLocaleLowerCase(),
			pageResourceType: location.pathname.split('/')[2],
		})
	}, [location.pathname, resource])

	return (
		<Panel open={!!resource}>
			{resource && resource.type === 'session' && (
				<SessionPanel resource={resource} />
			)}
			{resource && resource.type === 'error' && (
				<ErrorPanel resource={resource} />
			)}
			{resource && resource.type === 'logs' && (
				<LogsPanel resource={resource} />
			)}
			{resource && resource.type === 'trace' && (
				<TraceProvider
					projectId={projectId!}
					traceId={resource.id}
					spanId={resource.spanID}
					timestamp={resource.timestamp}
				>
					<TracePanel />
				</TraceProvider>
			)}
			{(resource?.type === 'traces' ||
				resource?.type === 'sessions' ||
				resource?.type === 'errors') && (
				<RelatedResourceList resource={resource} />
			)}
		</Panel>
	)
}
