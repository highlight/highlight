import {
	ButtonIcon,
	IconSolidChatAlt_2,
	IconSolidInspect,
	Stack,
	Tooltip,
} from '@highlight-run/ui'
import { themeVars } from '@highlight-run/ui/src/css/theme.css'
import React from 'react'

import { KeyboardShortcut } from '@/components/KeyboardShortcut/KeyboardShortcut'
import {
	RightPanelView,
	usePlayerUIContext,
} from '@/pages/Player/context/PlayerUIContext'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'

type Mode = 'comment' | 'inspect'

export const PlayerModeSwitch: React.FC = () => {
	const { setRightPanelView } = usePlayerUIContext()
	const { enableInspectElement, setEnableInspectElement } =
		usePlayerConfiguration()

	const mode: Mode = enableInspectElement ? 'inspect' : 'comment'

	return (
		<Stack
			borderRadius="8"
			p="2"
			align="center"
			direction="row"
			gap="1"
			style={{
				// Use shadow instead of border to avoid expanding height of the bar
				boxShadow: `0 0 0 1px ${themeVars.interactive.outline.secondary.enabled} inset`,
			}}
		>
			<Tooltip
				placement="bottom"
				trigger={
					<ButtonIcon
						icon={<IconSolidInspect />}
						kind={mode === 'inspect' ? 'primary' : 'secondary'}
						emphasis={mode === 'inspect' ? 'high' : 'low'}
						size="xSmall"
						onClick={() => {
							setEnableInspectElement(true)
							setRightPanelView(RightPanelView.Event)
						}}
					/>
				}
				delayed
			>
				<KeyboardShortcut label="Enable inspect mode" shortcut="d" />
			</Tooltip>
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
						}}
					/>
				}
				delayed
			>
				<KeyboardShortcut label="Enable comment mode" shortcut="c" />
			</Tooltip>
		</Stack>
	)
}
