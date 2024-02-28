import React from 'react'

import styles from './RadioGroup.module.css'

export const RadioGroup = <T extends string | number>({
	onSelect,
	labels,
	selectedLabel,
	labelStyle,
	wrapperStyle,
}: {
	onSelect: (p: T) => void
	labels: T[]
	selectedLabel: T
	labelStyle?: React.CSSProperties
	wrapperStyle?: React.CSSProperties
}) => {
	const labelDivs = labels.map((label, i) => {
		return label === selectedLabel ? (
			<div
				key={i}
				style={{
					borderColor: 'var(--color-purple)',
					backgroundColor: 'var(--color-purple)',
					color: 'var(--text-primary-inverted)',
					...labelStyle,
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
					...labelStyle,
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
		<div style={wrapperStyle} className={styles.radioGroupWrapper}>
			{labelDivs}
		</div>
	)
}
