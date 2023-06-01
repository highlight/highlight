import {
	Stack,
	ButtonIcon,
	IconSolidCursorClick,
	IconSolidChatAlt_2,
	IconSolidInspect,
} from '@highlight-run/ui'
import React, { useState } from 'react'

import * as styles from './styles.css'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@/pages/Player/context/PlayerUIContext'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'

type Props = React.PropsWithChildren & {}

// TODO: Get modes from context/state
type Mode = 'default' | 'comment' | 'inspect' | null

export const PlayerModeSwitch: React.FC<Props> = ({ children }) => {
	const { rightPanelView, setRightPanelView } = usePlayerUIContext()
	const { showRightPanel, setShowRightPanel } = usePlayerConfiguration()

	const mode: Mode =
		showRightPanel && rightPanelView === RightPanelView.Comments
			? 'default'
			: true
			? 'comment'
			: true
			? 'inspect'
			: null

	return (
		<Stack
			border="secondary"
			borderRadius="8"
			p="2"
			align="center"
			direction="row"
			gap="1"
		>
			<ButtonIcon
				icon={<IconSolidCursorClick />}
				kind={mode === 'default' ? 'primary' : 'secondary'}
				emphasis={mode === 'default' ? 'high' : 'low'}
				size="xSmall"
			/>
			<ButtonIcon
				icon={<IconSolidChatAlt_2 />}
				kind={mode === 'comment' ? 'primary' : 'secondary'}
				emphasis={mode === 'comment' ? 'high' : 'low'}
				size="xSmall"
				onChange={() => {
					setRightPanelView(RightPanelView.Comments)

					setShowRightPanel(
						!showRightPanel ||
							rightPanelView !== RightPanelView.Comments,
					)
				}}
			/>
			<ButtonIcon
				icon={<IconSolidInspect />}
				kind={mode === 'inspect' ? 'primary' : 'secondary'}
				emphasis={mode === 'inspect' ? 'high' : 'low'}
				size="xSmall"
			/>
		</Stack>
	)
}
