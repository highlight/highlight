import { Panel } from '@/components/Panel/Panel'
import { useRelatedResources } from '@/components/RelatedResourcePanel/hooks'

type Props = React.PropsWithChildren & {}

export const RelatedResourcePanel: React.FC<Props> = ({}) => {
	// TODO: Break this out to a new hook that has types for the params and an API
	// for pushing/popping from the panel stack.
	const { resources } = useRelatedResources()
	const open = resources.length > 0

	return <Panel open={open}>This is the related resource panel!</Panel>
}
