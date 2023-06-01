import {
	Stack,
	ButtonIcon,
	IconSolidChatAlt_2,
	IconSolidInspect,
	Tooltip,
} from '@highlight-run/ui'
import React from 'react'

import {
	RightPanelView,
	usePlayerUIContext,
} from '@/pages/Player/context/PlayerUIContext'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { KeyboardShortcut } from '@/components/KeyboardShortcut/KeyboardShortcut'

type Mode = 'comment' | 'inspect'

export const PlayerModeSwitch: React.FC = () => {
	const { rightPanelView, setRightPanelView } = usePlayerUIContext()
	const {
		enableInspectElement,
		setEnableInspectElement,
		showRightPanel,
		setShowRightPanel,
	} = usePlayerConfiguration()

	const mode: Mode = enableInspectElement ? 'inspect' : 'comment'

	return (
		<Stack
			border="secondary"
			borderRadius="8"
			p="2"
			align="center"
			direction="row"
			gap="1"
		>
			<Tooltip
				placement="bottom"
				trigger={
					<ButtonIcon
						icon={<IconSolidChatAlt_2 />}
						kind={mode === 'comment' ? 'primary' : 'secondary'}
						emphasis={mode === 'comment' ? 'high' : 'low'}
						size="xSmall"
						onClick={() => {
							setEnableInspectElement(false)
							setRightPanelView(RightPanelView.Comments)
							setShowRightPanel(true)
						}}
					/>
				}
				timeout={1000}
			>
				<KeyboardShortcut label="Enable comment mode" shortcut={'c'} />
			</Tooltip>
			<Tooltip
				placement="bottom"
				trigger={
					<ButtonIcon
						icon={<IconSolidInspect />}
						kind={mode === 'inspect' ? 'primary' : 'secondary'}
						emphasis={mode === 'inspect' ? 'high' : 'low'}
						size="xSmall"
						onClick={() => {
							setShowRightPanel(false)
							setEnableInspectElement(true)
						}}
					/>
				}
				timeout={1000}
			>
				<KeyboardShortcut label="Enable inspect mode" shortcut={'d'} />
			</Tooltip>
		</Stack>
	)
}
