import { Box, Text } from '@highlight-run/ui/components'
import clsx from 'clsx'

import styles from './IssueModeSelector.module.css'

export const TagSwitch = <T extends string | number>({
	onSelect,
	label,
	key,
	selected,
}: {
	onSelect: (p: T) => void
	label: any
	key: any
	selected: boolean
}) => {
	const modeClass = selected ? styles.activeSwitch : styles.inactiveSwitch

	return (
		<div
			key={key}
			className={clsx(styles.tagSwitch, modeClass)}
			onClick={() => onSelect(label)}
		>
			<Text userSelect="none" size="small" weight="medium">
				{label}
			</Text>
		</div>
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
	const labelDivs = labels.map((label, i) => {
		return (
			<TagSwitch
				selected={label === selectedLabel}
				onSelect={onSelect as any}
				key={i}
				label={label}
			/>
		)
	})
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
			{labelDivs}
		</Box>
	)
}
