import { Box, Dialog } from '@highlight-run/ui/components'
import { useRef, useState } from 'react'
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
type ResourcePanelProps = { resource: RelatedResource }

export const RelatedResourcePanel: React.FC<Props> = ({}) => {
	const { resources, pop } = useRelatedResources()

	useHotkeys('esc', pop, [])

	return (
		<>
			{resources.map((resource) => {
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

const Panel: React.FC<React.PropsWithChildren<{ open: boolean }>> = ({
	children,
	open,
}) => {
	const dragHandleRef = useRef<HTMLDivElement>(null)
	const [dragging, setDragging] = useState(false)
	const [width, setWidth] = useState(75)
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
			backdrop={<Box style={{ background: 'rgba(0, 0, 0, 0.05)' }} />}
			className={styles.panel}
			style={{ width: `${width}%` }}
		>
			<Box
				ref={dragHandleRef}
				cssClass={styles.panelDragHandle}
				onMouseDown={() => setDragging(true)}
				onMouseUp={() => setDragging(false)}
				onMouseLeave={() => setDragging(false)}
				onMouseMove={(e) => {
					if (dragging) {
						setWidth((e.clientX / window.innerWidth) * 100)
					}
				}}
			/>

			{children}
		</Dialog>
	)
}
