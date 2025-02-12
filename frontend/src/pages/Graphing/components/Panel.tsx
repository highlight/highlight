import { Box } from '@highlight-run/ui/components'
import { useCallback, useEffect, useRef } from 'react'

import * as styles from './Panel.css'
import useLocalStorage from '@rehooks/local-storage'

// Numbers are pixels
const MIN_PANEL_WIDTH = 20
const DEFAULT_PANEL_WIDTH = 30
const MAX_PANEL_WIDTH = 85

const LOCAL_STORAGE_WIDTH_KEY = 'graphing-editor-panel-width'

type Props = React.PropsWithChildren<{}>

export const Panel: React.FC<Props> = ({ children }) => {
	const dragHandleRef = useRef<HTMLDivElement>(null)
	const dragging = useRef(false)

	const [panelWidth, setPanelWidth] = useLocalStorage(
		LOCAL_STORAGE_WIDTH_KEY,
		DEFAULT_PANEL_WIDTH,
	)

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!dragging.current) {
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	)

	const handleMouseUp = useCallback(() => {
		dragging.current = false
	}, [])

	useEffect(() => {
		window.addEventListener('mousemove', handleMouseMove, true)
		window.addEventListener('mouseup', handleMouseUp, true)

		return () => {
			window.removeEventListener('mousemove', handleMouseMove, true)
			window.removeEventListener('mouseup', handleMouseUp, true)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Box
			position="relative"
			borderLeft="dividerWeak"
			height="full"
			overflowY="auto"
			overflowX="hidden"
			style={{ width: `${panelWidth}%` }}
			py="12"
			px="16"
		>
			<Box
				ref={dragHandleRef}
				cssClass={styles.panelDragHandle}
				onMouseDown={(e) => {
					e.preventDefault()
					dragging.current = true
				}}
			/>

			{children}
		</Box>
	)
}
