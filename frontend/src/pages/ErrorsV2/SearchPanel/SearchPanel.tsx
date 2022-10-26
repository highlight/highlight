import ErrorFeed from '@pages/ErrorsV2/ErrorFeed/ErrorFeed'
import classNames from 'classnames'

import useErrorPageConfiguration from '../../Error/utils/ErrorPageUIConfiguration'
import PanelToggleButton from '../../Player/components/PanelToggleButton/PanelToggleButton'
import styles from './SearchPanel.module.scss'

const SearchPanel = () => {
	const { setShowLeftPanel, showLeftPanel } = useErrorPageConfiguration()

	return (
		<aside
			className={classNames(styles.searchPanel, {
				[styles.hidden]: !showLeftPanel,
			})}
		>
			{showLeftPanel && <ErrorFeed />}
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

export default SearchPanel
