import { KeyboardShortcut } from '@components/KeyboardShortcut/KeyboardShortcut'
import {
	Box,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	Tag,
	Tooltip,
} from '@highlight-run/ui'

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
		<Box
			borderRadius="6"
			overflow="hidden"
			display="flex"
			flexShrink={0}
			alignItems="center"
		>
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

			<Box as="span" borderRight="secondary" style={{ height: 16 }} />

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
