import { KeyboardShortcut } from '@components/KeyboardShortcut/KeyboardShortcut'
import {
	Box,
	ButtonIcon,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
} from '@highlight-run/ui'
import { shadows } from '@highlight-run/ui/src/components/Button/styles.css'
import { colors } from '@highlight-run/ui/src/css/colors'
import * as styles from '@pages/Player/SessionLevelBar/SessionLevelBarV2.css'
import ExplanatoryPopover from '@pages/Player/Toolbar/ExplanatoryPopover/ExplanatoryPopover'
import clsx from 'clsx'
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
		<Box
			borderRadius="6"
			display="flex"
			marginRight="8"
			style={{
				boxShadow: shadows.n5,
				height: 28,
				width: 56,
			}}
		>
			<ExplanatoryPopover
				content={
					<KeyboardShortcut
						label="Previous"
						shortcut={prevShortcut ?? 'j'}
					/>
				}
			>
				<ButtonIcon
					kind="secondary"
					size="small"
					shape="square"
					emphasis="low"
					icon={<IconSolidCheveronUp size={14} color={colors.n11} />}
					cssClass={clsx(
						styles.sessionSwitchButton,
						styles.sessionSwitchButtonLeft,
					)}
					onClick={onPrev}
					disabled={!canMoveBackward}
				/>
			</ExplanatoryPopover>
			<Box as="span" borderRight="secondary" />
			<ExplanatoryPopover
				content={
					<KeyboardShortcut
						label="Next"
						shortcut={nextShortcut ?? 'k'}
					/>
				}
			>
				<ButtonIcon
					kind="secondary"
					size="small"
					shape="square"
					emphasis="low"
					icon={
						<IconSolidCheveronDown size={14} color={colors.n11} />
					}
					title="j"
					cssClass={clsx(
						styles.sessionSwitchButton,
						styles.sessionSwitchButtonRight,
					)}
					onClick={onNext}
					disabled={!canMoveForward}
				/>
			</ExplanatoryPopover>
		</Box>
	)
}
