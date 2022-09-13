import React from 'react'

import styles from './RadioGroup.module.scss'

export const RadioGroup = <T extends string | number>({
	onSelect,
	labels,
	selectedLabel,
	style,
}: {
	onSelect: (p: T) => void
	labels: T[]
	selectedLabel: T
	style?: React.CSSProperties
}) => {
	const labelDivs = labels.map((label, i) => {
		return label === selectedLabel ? (
			<div
				key={i}
				style={{
					borderColor: 'var(--color-purple)',
					backgroundColor: 'var(--color-purple)',
					color: 'var(--text-primary-inverted)',
				}}
				className={styles.platformOption}
				onClick={() => onSelect(label)}
			>
				{' '}
				{label}{' '}
			</div>
		) : (
			<div
				key={i}
				style={{
					borderColor: 'var(--color-gray-300)',
					color: 'var(--text-primary)',
				}}
				className={styles.platformOption}
				onClick={() => onSelect(label)}
			>
				{' '}
				{label}{' '}
			</div>
		)
	})
	return (
		<div style={style} className={styles.radioGroupWrapper}>
			{labelDivs}
		</div>
	)
}
