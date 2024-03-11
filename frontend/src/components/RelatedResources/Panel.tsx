import { Box, Dialog } from '@highlight-run/ui/components'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useRelatedResource } from '@/components/RelatedResources/hooks'
import { PanelHeader } from '@/components/RelatedResources/PanelHeader'

import * as styles from './Panel.css'

const MIN_PANEL_WIDTH = 40

type Props = React.PropsWithChildren<{
	open: boolean
}>

type PanelComponent = React.FC<Props> & {
	Header: typeof PanelHeader
}

export const Panel: PanelComponent = ({ children, open }) => {
	const dragHandleRef = useRef<HTMLDivElement>(null)
	const [dragging, setDragging] = useState(false)
	const { resource, remove, panelWidth, setPanelWidth } = useRelatedResource()
	const location = useLocation()
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

	useEffect(() => {
		if (resource) {
			remove()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname])

	return (
		<Dialog
			store={dialogStore}
			modal={false}
			autoFocusOnShow={false}
			backdrop={<Box cssClass={styles.backdrop} />}
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

Panel.Header = PanelHeader
