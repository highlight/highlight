import { KeyboardShortcut } from '@components/KeyboardShortcut/KeyboardShortcut'
import {
	Box,
	ButtonIcon,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	Tooltip,
} from '@highlight-run/ui'
import React from 'react'

import * as style from './style.css'

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
						onClick={onPrev}
						disabled={!canMoveBackward}
						cssClass={style.leftButton}
					/>
				}
				timeout={1000}
				disabled={!canMoveBackward}
			>
				<KeyboardShortcut
					label="Previous"
					shortcut={prevShortcut ?? 'k'}
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
						onClick={onNext}
						disabled={!canMoveForward}
						cssClass={style.rightButton}
					/>
				}
				timeout={1000}
				disabled={!canMoveForward}
			>
				<KeyboardShortcut label="Next" shortcut={nextShortcut ?? 'j'} />
			</Tooltip>
		</Box>
	)
}
