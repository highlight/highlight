import { useHTMLElementEvent } from '@hooks/useHTMLElementEvent'
import { useWindowEvent } from '@hooks/useWindowEvent'
import PerformancePage from '@pages/Player/Toolbar/DevToolsWindow/PerformancePage/PerformancePage'
import React from 'react'

import Tabs, { TabItem } from '../../../../components/Tabs/Tabs'
import SvgXIcon from '../../../../static/XIcon'
import { usePlayerUIContext } from '../../context/PlayerUIContext'
import DOMInteractionsToggle from '../../DOMInteractionsToggle/DOMInteractionsToggle'
import { useDevToolsContext } from '../DevToolsContext/DevToolsContext'
import { ConsolePage } from './ConsolePage/ConsolePage'
import styles from './DevToolsWindow.module.scss'
import ErrorsPage from './ErrorsPage/ErrorsPage'
import { ResourcePage } from './ResourcePage/ResourcePage'

export const DevToolsWindow = React.memo(
	({ time, startTime }: { time: number; startTime: number }) => {
		const { openDevTools, setOpenDevTools } = useDevToolsContext()
		const { isPlayerFullscreen } = usePlayerUIContext()

		if (!openDevTools || isPlayerFullscreen) {
			return null
		}

		const TABS: TabItem[] = [
			{
				key: 'Errors',
				panelContent: <ErrorsPage />,
			},
			{
				key: 'Console',
				panelContent: <ConsolePage time={time} />,
			},
			{
				key: 'Network',
				panelContent: (
					<ResourcePage startTime={startTime} time={time} />
				),
			},
			{
				key: 'Performance',
				panelContent: (
					<PerformancePage currentTime={time} startTime={startTime} />
				),
			},
		]

		return (
			<ResizePanel>
				{({ panelRef, handleRef }) => (
					<div className={styles.devToolsWrapper} ref={panelRef}>
						<button
							className="flex cursor-ns-resize justify-center border-none bg-transparent p-2 outline-none"
							ref={handleRef}
						>
							<div className="relative h-2 w-10 rounded-full bg-gray-200" />
						</button>
						<DevToolsTabs
							closeDevToolsHandler={() => {
								setOpenDevTools(false)
							}}
							tabs={TABS}
						/>
					</div>
				)}
			</ResizePanel>
		)
	},
)

interface Props {
	closeDevToolsHandler: () => void
	tabs: TabItem[]
}

const DevToolsTabs = React.memo(({ closeDevToolsHandler, tabs }: Props) => {
	return (
		<Tabs
			tabs={tabs}
			id="DevTools"
			noPadding
			className={styles.tabs}
			tabBarExtraContent={
				<>
					<DOMInteractionsToggle />
					<SvgXIcon
						className={styles.closeStyle}
						onClick={closeDevToolsHandler}
					/>
				</>
			}
		/>
	)
})

function ResizePanel({
	children,
}: {
	children: (props: {
		panelRef: (element: HTMLElement | null) => void
		handleRef: (element: HTMLElement | null) => void
	}) => React.ReactNode
}) {
	const [panel, panelRef] = React.useState<HTMLElement | null>()
	const [handle, handleRef] = React.useState<HTMLElement | null>()
	const [dragging, setDragging] = React.useState(false)

	useHTMLElementEvent(handle, 'pointerdown', (event) => {
		if (handle && event.composedPath().includes(handle)) {
			setDragging(true)
		}
	})

	useWindowEvent(
		'pointermove',
		(event) => {
			if (dragging && panel) {
				const panelRect = panel.getBoundingClientRect()
				const newHeight = panelRect.height - event.movementY
				panel.style.height = `${newHeight}px`
			}
		},
		{ passive: true },
	)

	useWindowEvent('pointerup', () => {
		setDragging(false)
	})

	return <>{children({ panelRef, handleRef })}</>
}
