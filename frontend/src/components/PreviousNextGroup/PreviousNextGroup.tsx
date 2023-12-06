import { KeyboardShortcut } from '@components/KeyboardShortcut/KeyboardShortcut'
import {
	Box,
	ButtonIcon,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	Tooltip,
} from '@highlight-run/ui/components'

export const PreviousNextGroup = function ({
	onPrev,
	canMoveBackward,
	prevShortcut,
	onNext,
	canMoveForward,
	nextShortcut,
	size = 'small',
}: {
	onPrev: () => void
	canMoveBackward: boolean
	prevShortcut?: string
	onNext: () => void
	canMoveForward: boolean
	nextShortcut?: string
	size?: 'xSmall' | 'small' | 'medium'
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
					<ButtonIcon
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
					<ButtonIcon
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
