import { KeyboardShortcut } from '@components/KeyboardShortcut/KeyboardShortcut'
import {
	Box,
	ButtonIcon,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	Tooltip,
} from '@highlight-run/ui'
import * as styles from '@pages/Player/SessionLevelBar/SessionLevelBarV2.css'
import React from 'react'

export const PreviousNextGroup = function ({
	onPrev,
	canMoveBackward,
	prevShortcut,
	onNext,
	canMoveForward,
	nextShortcut,
}: {
	onPrev: () => void
	canMoveBackward: boolean
	prevShortcut?: string
	onNext: () => void
	canMoveForward: boolean
	nextShortcut?: string
}) {
	return (
		<Box borderRadius="6" overflow="hidden" display="flex" flexShrink={0}>
			<Tooltip
				placement="bottom-end"
				trigger={
					<ButtonIcon
						kind="secondary"
						size="small"
						shape="square"
						emphasis="low"
						icon={<IconSolidCheveronUp size={14} />}
						cssClass={styles.sessionSwitchButton}
						onClick={onPrev}
						disabled={!canMoveBackward}
					/>
				}
				timeout={1000}
			>
				<KeyboardShortcut
					label="Previous"
					shortcut={prevShortcut ?? 'j'}
				/>
			</Tooltip>

			<Box as="span" borderRight="secondary" />

			<Tooltip
				placement="bottom-start"
				trigger={
					<ButtonIcon
						kind="secondary"
						size="small"
						shape="square"
						emphasis="low"
						icon={<IconSolidCheveronDown size={14} />}
						title="j"
						cssClass={styles.sessionSwitchButton}
						onClick={onNext}
						disabled={!canMoveForward}
					/>
				}
				timeout={1000}
			>
				<KeyboardShortcut label="Next" shortcut={nextShortcut ?? 'k'} />
			</Tooltip>
		</Box>
	)
}
