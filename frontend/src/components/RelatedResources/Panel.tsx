import { Box, Dialog } from '@highlight-run/ui/components'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useRelatedResource } from '@/components/RelatedResources/hooks'
import {
	PanelHeader,
	PanelHeaderCopyLinkButton,
	PanelHeaderDivider,
} from '@/components/RelatedResources/PanelHeader'

import * as styles from './Panel.css'

// Numbers are percentages
const MIN_PANEL_WIDTH = 30
const MAX_PANEL_WIDTH = 85

type Props = React.PropsWithChildren<{
	open: boolean
}>

type PanelComponent = React.FC<Props> & {
	Header: typeof PanelHeader
	HeaderDivider: typeof PanelHeaderDivider
	HeaderCopyLinkButton: typeof PanelHeaderCopyLinkButton
}

export const Panel: PanelComponent = ({ children, open }) => {
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
			if (!dragging) {
				return
			}

			e.stopPropagation()
			e.preventDefault()

			const newWidth =
				((window.innerWidth - e.clientX) / window.innerWidth) * 100

			setPanelWidth(
				Math.min(Math.max(newWidth, MIN_PANEL_WIDTH), MAX_PANEL_WIDTH),
			)
		},
		[dragging, setPanelWidth],
	)

	const handleMouseUp = useCallback(() => {
		setDragging(false)
	}, [])

	useEffect(() => {
		if (dragging) {
			window.addEventListener('mousemove', handleMouseMove, true)
			window.addEventListener('mouseup', handleMouseUp, true)
		} else {
			window.removeEventListener('mousemove', handleMouseMove, true)
			window.removeEventListener('mouseup', handleMouseUp, true)
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove, true)
			window.removeEventListener('mouseup', handleMouseUp, true)
		}
	}, [dragging, handleMouseMove, handleMouseUp])

	return (
		<Dialog
			store={dialogStore}
			modal={false}
			autoFocusOnShow={false}
			hideOnEscape={true}
			backdrop={false}
			className={styles.panel}
			style={{ width: `${panelWidth}%` }}
			// unmountOnHide is required for this to work as expected when it's being
			// rendered on top of another dialog.
			unmountOnHide
		>
			<Box
				ref={dragHandleRef}
				cssClass={styles.panelDragHandle}
				onMouseDown={(e) => {
					e.preventDefault()
					setDragging(true)
				}}
			/>

			{children}
		</Dialog>
	)
}

Panel.Header = PanelHeader
Panel.HeaderDivider = PanelHeaderDivider
Panel.HeaderCopyLinkButton = PanelHeaderCopyLinkButton
