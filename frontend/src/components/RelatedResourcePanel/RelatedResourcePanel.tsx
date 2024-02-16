import { Box, Dialog } from '@highlight-run/ui/components'
import { useHotkeys } from 'react-hotkeys-hook'

import {
	RelatedResource,
	useRelatedResources,
} from '@/components/RelatedResourcePanel/hooks'
import { useGetErrorGroupQuery } from '@/graph/generated/hooks'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { ErrorDisplay } from '@/pages/ErrorsV2/ErrorsV2'
import { TracePage } from '@/pages/Traces/TracePage'
import { TraceProvider } from '@/pages/Traces/TraceProvider'
import { useIntegratedLocalStorage } from '@/util/integrated'

import * as styles from './RelatedResourcePanel.css'

type Props = React.PropsWithChildren & {}
type ResourcePanelProps = { depth: number; resource: RelatedResource }

export const RelatedResourcePanel: React.FC<Props> = ({}) => {
	const { resources, pop } = useRelatedResources()

	useHotkeys('esc', pop, [])

	return (
		<>
			{resources.map((resource, index) => {
				switch (resource.type) {
					case 'session':
						return (
							<SessionPanel
								key={`${resource.type}-${resource.id}`}
								depth={index}
								resource={resource}
							/>
						)
					case 'error':
						return (
							<ErrorPanel
								key={`${resource.type}-${resource.id}`}
								depth={index}
								resource={resource}
							/>
						)
					case 'trace':
						return (
							<TracePanel
								key={`${resource.type}-${resource.id}`}
								depth={index}
								resource={resource}
							/>
						)
				}
			})}
		</>
	)
}

const TracePanel: React.FC<ResourcePanelProps> = ({ resource }) => {
	const { projectId } = useNumericProjectId()

	return (
		<Panel open={true}>
			<TraceProvider projectId={projectId!} traceId={resource.id}>
				<TracePage />
			</TraceProvider>
		</Panel>
	)
}

const ErrorPanel: React.FC<ResourcePanelProps> = ({ resource }) => {
	const { projectId } = useNumericProjectId()
	const [{ integrated }] = useIntegratedLocalStorage(projectId!, 'server')
	const { data, loading, error } = useGetErrorGroupQuery({
		variables: {
			secure_id: resource.id!,
			use_clickhouse: true,
		},
	})

	console.log('::: data', data, error)

	return (
		<Panel open={true}>
			<ErrorDisplay
				errorGroup={data?.error_group}
				integrated={integrated}
				isBlocked={false}
				isBlockedLoading={false}
				isErrorGroupError={!!error}
				isErrorState={!!error}
				loading={loading}
			/>
		</Panel>
	)
}

const SessionPanel: React.FC<ResourcePanelProps> = ({ resource }) => {
	return (
		<Panel open={true}>
			This is the session panel!
			<Box p="8" border="dividerWeak" my="8" borderRadius="4">
				<pre>{JSON.stringify(resource)}</pre>
			</Box>
		</Panel>
	)
}

const Panel: React.FC<
	React.PropsWithChildren<{ depth: number; open: boolean }>
> = ({ children, depth, open }) => {
	const { pop } = useRelatedResources()
	const dialogStore = Dialog.useStore({
		open,
		setOpen: (open) => {
			if (!open) {
				pop()
			}
		},
	})

	return (
		<Dialog
			store={dialogStore}
			modal={false}
			autoFocusOnShow={false}
			className={styles.panel}
			backdrop={<Box style={{ background: 'rgba(0, 0, 0, 0.1)' }} />}
		>
			{children}
		</Dialog>
	)
}
