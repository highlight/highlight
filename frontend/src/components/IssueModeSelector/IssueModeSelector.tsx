import { Box, Text } from '@highlight-run/ui/components'
import clsx from 'clsx'

import * as styles from './IssueModeSelector.css'

export const TagSwitch = <T extends string | number>({
	onSelect,
	label,
	selected,
}: {
	onSelect: (p: T) => void
	label: any
	key: any
	selected: boolean
}) => {
	return (
		<Box
			pt="2"
			pb="2"
			pl="6"
			pr="6"
			borderRadius="6"
			display="flex"
			cursor="pointer"
			alignItems="center"
			justifyContent="center"
			gap="2"
			cssClass={clsx({
				[styles.activeSwitch]: selected,
				[styles.inactiveSwitch]: !selected,
			})}
			onClick={() => onSelect(label)}
			style={{ height: '24px' }}
			width="full"
		>
			<Text
				color={selected ? 'white' : 'secondaryContentText'}
				userSelect="none"
				size="small"
				weight="medium"
			>
				{label}
			</Text>
		</Box>
	)
}

export const IssueModeSelector = <T extends string | number>({
	onSelect,
	labels,
	selectedLabel,
}: {
	onSelect: (p: T) => void
	labels: T[]
	selectedLabel: T
}) => {
	return (
		<Box
			borderRadius="10"
			p="3"
			gap="3"
			alignSelf="stretch"
			alignItems="flex-start"
			background="default"
			display="flex"
			backgroundColor="n3"
		>
			{labels.map((label, i) => {
				return (
					<TagSwitch
						selected={label === selectedLabel}
						onSelect={onSelect as any}
						key={i}
						label={label}
					/>
				)
			})}
		</Box>
	)
}
