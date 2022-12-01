import { useWindowSize } from '@hooks/useWindowSize'
import PerformancePage from '@pages/Player/Toolbar/DevToolsWindow/PerformancePage/PerformancePage'
import {
	DEV_TOOLS_MIN_HEIGHT,
	ResizePanel,
} from '@pages/Player/Toolbar/DevToolsWindowV2/ResizePanel'
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
	({
		time,
		startTime,
		width,
	}: {
		time: number
		startTime: number
		width: number
	}) => {
		const { openDevTools, setOpenDevTools } = useDevToolsContext()
		const { isPlayerFullscreen } = usePlayerUIContext()

		const { height } = useWindowSize()
		const maxHeight = Math.max(DEV_TOOLS_MIN_HEIGHT, height / 2)
		const defaultHeight = Math.max(DEV_TOOLS_MIN_HEIGHT, maxHeight / 2)

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

		if (!openDevTools || isPlayerFullscreen) {
			return null
		}

		return (
			<ResizePanel
				defaultHeight={defaultHeight}
				minHeight={DEV_TOOLS_MIN_HEIGHT}
				maxHeight={maxHeight}
				heightPersistenceKey="highlight-devToolsPanelHeight"
			>
				{({ panelRef, handleRef }) => (
					<div
						className={styles.devToolsWrapper}
						ref={panelRef}
						style={{ width }}
					>
						<button
							className="flex cursor-ns-resize justify-center border-none bg-transparent p-2 outline-none"
							ref={handleRef}
						>
							<div className="relative h-2 w-10 rounded-full bg-gray-200" />
						</button>
						<Tabs
							tabs={TABS}
							id="DevTools"
							noPadding
							className={styles.tabs}
							tabBarExtraContent={
								<>
									<DOMInteractionsToggle />
									<SvgXIcon
										className={styles.closeStyle}
										onClick={() => {
											setOpenDevTools(false)
										}}
									/>
								</>
							}
						/>
					</div>
				)}
			</ResizePanel>
		)
	},
)
