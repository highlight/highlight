import { ErrorPanel } from '@/components/RelatedResources/ErrorPanel'
import {
	RelatedResource,
	useRelatedResource,
} from '@/components/RelatedResources/hooks'
import { SessionPanel } from '@/components/RelatedResources/SessionPanel'
import { TracePanel } from '@/components/RelatedResources/TracePanel'

type Props = React.PropsWithChildren & {}
export type ResourcePanelProps = { resource: RelatedResource }

export const RelatedResourcePanel: React.FC<Props> = ({}) => {
	const { resource } = useRelatedResource()

	if (!resource) {
		return null
	}

	switch (resource.type) {
		case 'session':
			return (
				<SessionPanel
					key={`${resource.type}-${resource.id}`}
					resource={resource}
				/>
			)
		case 'error':
			return (
				<ErrorPanel
					key={`${resource.type}-${resource.id}`}
					resource={resource}
				/>
			)
		case 'trace':
			return (
				<TracePanel
					key={`${resource.type}-${resource.id}`}
					resource={resource}
				/>
			)
	}
}
