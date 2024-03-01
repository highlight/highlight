import { useHotkeys } from 'react-hotkeys-hook'

import { ErrorPanel } from '@/components/RelatedResourcePanel/ErrorPanel'
import {
	RelatedResource,
	useRelatedResource,
} from '@/components/RelatedResourcePanel/hooks'
import { SessionPanel } from '@/components/RelatedResourcePanel/SessionPanel'
import { TracePanel } from '@/components/RelatedResourcePanel/TracePanel'

type Props = React.PropsWithChildren & {}
export type ResourcePanelProps = { resource: RelatedResource }

export const RelatedResourcePanel: React.FC<Props> = ({}) => {
	const { resource, remove } = useRelatedResource()

	useHotkeys('esc', remove, [])

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
