import Button from '@components/Button/Button/Button'
import Popover from '@components/Popover/Popover'
import PopoverListContent from '@components/Popover/PopoverListContent'
import SvgSettingsIcon from '@icons/SettingsIcon'
import { getFullScreenPopoverGetPopupContainer } from '@pages/Player/context/PlayerUIContext'
import {
	AutoPlayToolbarItem,
	DevToolsToolbarItem,
	MouseTrailToolbarItem,
	PlaybackSpeedControlToolbarItem,
	PlayerTimeToolbarItem,
	SkipInactiveToolbarItem,
	TimelineAnnotationsToolbarItem,
} from '@pages/Player/Toolbar/ToolbarItems/ToolbarItems'
import React from 'react'

import toolbarStyles from '../Toolbar.module.scss'
import styles from './ToolbarMenu.module.scss'

interface Props {
	loading: boolean
}

const ToolbarMenu = React.memo(({ loading }: Props) => {
	return (
		<Popover
			getPopupContainer={getFullScreenPopoverGetPopupContainer}
			placement="topLeft"
			trigger={['click']}
			contentContainerClassName={styles.popover}
			content={
				<>
					<PopoverListContent
						className={toolbarStyles.settingsPopover}
						noHoverChange
						listItems={[
							<AutoPlayToolbarItem
								key="sessionAutoplay"
								loading={loading}
								renderContext="menu"
							/>,
							<SkipInactiveToolbarItem
								key="skipInactive"
								loading={loading}
								renderContext="menu"
							/>,
							<MouseTrailToolbarItem
								key="mouseTrail"
								loading={loading}
								renderContext="menu"
							/>,
							<PlaybackSpeedControlToolbarItem
								key="PlaybackSpeed"
								loading={loading}
								renderContext="menu"
							/>,
							<TimelineAnnotationsToolbarItem
								loading={loading}
								key="timelineAnnotations"
								renderContext="menu"
							/>,
							<DevToolsToolbarItem
								key="devtools"
								loading={loading}
								renderContext="menu"
							/>,
							<PlayerTimeToolbarItem
								key="playerTime"
								loading={loading}
								renderContext="menu"
							/>,
						]}
					/>
				</>
			}
		>
			<Button
				trackingId="PlayerToolbarSettings"
				className={toolbarStyles.settingsButton}
			>
				<SvgSettingsIcon className={toolbarStyles.devToolsIcon} />
			</Button>
		</Popover>
	)
})

export default ToolbarMenu
