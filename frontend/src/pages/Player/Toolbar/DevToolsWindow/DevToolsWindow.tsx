import PerformancePage from '@pages/Player/Toolbar/DevToolsWindow/PerformancePage/PerformancePage'
import React from 'react'
import ResizePanel from 'react-resize-panel-ts'

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
			<ResizePanel
				direction="n"
				containerClass={styles.resizeContainer}
				handleClass={styles.resizeHandle}
				borderClass={styles.resizeBorder}
			>
				<div className={styles.devToolsWrapper}>
					<DevToolsTabs
						closeDevToolsHandler={() => {
							setOpenDevTools(false)
						}}
						tabs={TABS}
					/>
				</div>
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
