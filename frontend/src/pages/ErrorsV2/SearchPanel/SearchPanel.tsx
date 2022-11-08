import { Box } from '@highlight-run/ui'
import ErrorFeed from '@pages/ErrorsV2/ErrorFeed/ErrorFeed'
import clsx from 'clsx'

import useErrorPageConfiguration from '../../Error/utils/ErrorPageUIConfiguration'
import PanelToggleButton from '../../Player/components/PanelToggleButton/PanelToggleButton'
import * as style from './SearchPanel.css'

const SearchPanel = () => {
	const { setShowLeftPanel, showLeftPanel } = useErrorPageConfiguration()

	return (
		<Box
			display="flex"
			flexDirection="column"
			borderRight="neutral"
			position="relative"
			cssClass={clsx(style.searchPanel, {
				[style.searchPanelHidden]: !showLeftPanel,
			})}
			background="neutral50"
		>
			{showLeftPanel && <ErrorFeed />}
			<PanelToggleButton
				direction="left"
				className={clsx(style.searchPanelToggleButton, {
					[style.searchPanelToggleButtonHidden]: !showLeftPanel,
				})}
				isOpen={showLeftPanel}
				onClick={() => {
					setShowLeftPanel(!showLeftPanel)
				}}
			/>
		</Box>
	)
}

export default SearchPanel
