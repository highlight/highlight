import { Box, Dialog } from '@highlight-run/ui/components'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useRelatedResource } from '@/components/RelatedResourcePanel/hooks'

import * as styles from './RelatedResourcePanel.css'

const MIN_PANEL_WIDTH = 40

export const Panel: React.FC<React.PropsWithChildren<{ open: boolean }>> = ({
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
