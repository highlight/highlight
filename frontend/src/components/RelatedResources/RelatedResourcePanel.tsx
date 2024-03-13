import { ErrorPanel } from '@/components/RelatedResources/ErrorPanel'
import {
	RelatedResource,
	useRelatedResource,
} from '@/components/RelatedResources/hooks'
import { Panel } from '@/components/RelatedResources/Panel'
import { SessionPanel } from '@/components/RelatedResources/SessionPanel'
import { TracePanel } from '@/components/RelatedResources/TracePanel'

type Props = React.PropsWithChildren & {}
export type ResourcePanelProps = { resource: RelatedResource }

export const RelatedResourcePanel: React.FC<Props> = ({}) => {
	const { resource } = useRelatedResource()

	return (
		<Panel open={!!resource}>
			{resource && resource.type === 'session' && (
				<SessionPanel resource={resource} />
			)}
			{resource && resource.type === 'error' && (
				<ErrorPanel resource={resource} />
			)}
			{resource && resource.type === 'trace' && (
				<TracePanel resource={resource} />
			)}
		</Panel>
	)
}
