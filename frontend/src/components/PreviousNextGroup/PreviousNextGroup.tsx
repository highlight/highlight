import { KeyboardShortcut } from '@components/KeyboardShortcut/KeyboardShortcut'
import {
	Box,
	ButtonIcon,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	Tag,
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
	as = 'button',
}: {
	onPrev: () => void
	canMoveBackward: boolean
	prevShortcut?: string
	onNext: () => void
	canMoveForward: boolean
	nextShortcut?: string
	as?: 'button' | 'tag'
}) {
	const Component = as === 'button' ? ButtonIcon : Tag

	return (
		<Box borderRadius="6" overflow="hidden" display="flex" flexShrink={0}>
			<Tooltip
				placement="bottom-end"
				trigger={
					<Component
						kind="secondary"
						size="small"
						emphasis="low"
						icon={<IconSolidCheveronUp size={14} />}
						onClick={onPrev}
						disabled={!canMoveBackward}
						className={style.leftButton}
					/>
				}
				delayed
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
					<Component
						kind="secondary"
						size="small"
						emphasis="low"
						icon={<IconSolidCheveronDown size={14} />}
						onClick={onNext}
						disabled={!canMoveForward}
						className={style.rightButton}
					/>
				}
				delayed
				disabled={!canMoveForward}
			>
				<KeyboardShortcut label="Next" shortcut={nextShortcut ?? 'j'} />
			</Tooltip>
		</Box>
	)
}
