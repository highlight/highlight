import { ErrorFeedV2 } from '@pages/Errors/ErrorFeedV2/ErrorFeedV2'
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import classNames from 'classnames'
import React from 'react'

import PanelToggleButton from '../../../Player/components/PanelToggleButton/PanelToggleButton'
import useErrorPageConfiguration from '../../utils/ErrorPageUIConfiguration'
import styles from './ErrorSearchPanel.module.scss'

const ErrorSearchPanel = () => {
	const { showBanner } = useGlobalContext()
	const { setShowLeftPanel, showLeftPanel } = useErrorPageConfiguration()

	return (
		<aside
			className={classNames(styles.errorSearchPanel, {
				[styles.hidden]: !showLeftPanel,
				[styles.bannerShown]: showBanner,
			})}
		>
			{showLeftPanel && <ErrorFeedV2 />}
			<PanelToggleButton
				direction="left"
				className={classNames(styles.panelToggleButton, {
					[styles.hidden]: !showLeftPanel,
				})}
				isOpen={showLeftPanel}
				onClick={() => {
					setShowLeftPanel(!showLeftPanel)
				}}
			/>
		</aside>
	)
}

export default ErrorSearchPanel
