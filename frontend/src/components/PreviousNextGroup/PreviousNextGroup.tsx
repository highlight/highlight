import { KeyboardShortcut } from '@components/KeyboardShortcut/KeyboardShortcut'
import {
	Box,
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
	size = 'large',
}: {
	onPrev: () => void
	canMoveBackward: boolean
	prevShortcut?: string
	onNext: () => void
	canMoveForward: boolean
	nextShortcut?: string
	size?: 'medium' | 'large'
}) {
	return (
		<Box borderRadius="6" overflow="hidden" display="flex" flexShrink={0}>
			<Tooltip
				placement="bottom-end"
				trigger={
					<Tag
						kind="secondary"
						size={size}
						emphasis="low"
						icon={<IconSolidCheveronUp size={14} />}
						onClick={onPrev}
						disabled={!canMoveBackward}
						className={style.leftButton}
						shape="basic"
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
					<Tag
						kind="secondary"
						size={size}
						emphasis="low"
						icon={<IconSolidCheveronDown size={14} />}
						onClick={onNext}
						disabled={!canMoveForward}
						className={style.rightButton}
						shape="basic"
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
