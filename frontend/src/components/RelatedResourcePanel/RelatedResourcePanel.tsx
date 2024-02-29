import { Box, Dialog } from '@highlight-run/ui/components'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import {
	RelatedResource,
	useRelatedResource,
} from '@/components/RelatedResourcePanel/hooks'
import { useNumericProjectId } from '@/hooks/useProjectId'
import { TracePage } from '@/pages/Traces/TracePage'
import { TraceProvider } from '@/pages/Traces/TraceProvider'

import * as styles from './RelatedResourcePanel.css'

type Props = React.PropsWithChildren & {}
type ResourcePanelProps = { resource: RelatedResource }

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
	return (
		<Panel open={true}>
			This is the error panel!
			<Box p="8" border="dividerWeak" my="8" borderRadius="4">
				<pre>{JSON.stringify(resource)}</pre>
			</Box>
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

const MIN_PANEL_WIDTH = 40

const Panel: React.FC<React.PropsWithChildren<{ open: boolean }>> = ({
	children,
	open,
}) => {
	const dragHandleRef = useRef<HTMLDivElement>(null)
	const [dragging, setDragging] = useState(false)
	const { remove, panelWidth, setPanelWidth } = useRelatedResource()
	const dialogStore = Dialog.useStore({
		open,
		setOpen: (open) => {
			if (!open) {
				remove()
			}
		},
	})

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (dragging) {
				const newWidth =
					((window.innerWidth - e.clientX) / window.innerWidth) * 100

				setPanelWidth(
					newWidth > MIN_PANEL_WIDTH ? newWidth : MIN_PANEL_WIDTH,
				)
			}
		},
		[dragging, setPanelWidth],
	)

	const handleMouseUp = useCallback(() => {
		setDragging(false)
	}, [])

	useEffect(() => {
		if (dragging) {
			window.addEventListener('mousemove', handleMouseMove)
			window.addEventListener('mouseup', handleMouseUp)
		} else {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [dragging, handleMouseMove, handleMouseUp])

	return (
		<Dialog
			store={dialogStore}
			modal={false}
			autoFocusOnShow={false}
			backdrop={<Box style={{ background: 'rgba(0, 0, 0, 0.05)' }} />}
			className={styles.panel}
			style={{ width: `${panelWidth}%` }}
		>
			<Box
				ref={dragHandleRef}
				cssClass={styles.panelDragHandle}
				onMouseDown={() => setDragging(true)}
			/>

			{children}
		</Dialog>
	)
}
