import styles from './Field.module.css'

const fieldColorMap = {
	normal: '#F2EEFB',
	warning: 'var(--color-orange-300)',
	default: '#eee7ff',
}

export const Field = ({
	k,
	v,
	color,
}: {
	k: string
	v: string
	color?: 'normal' | 'warning' | 'default'
}) => {
	const c = fieldColorMap[color || 'default']
	return (
		<div className={styles.wrapper} style={{ border: `1px solid ${c}` }}>
			<div className={styles.keyValueWrapper}>
				<div
					className={styles.key}
					style={{
						borderRight: `1px solid ${c}`,
					}}
				>
					{k}
				</div>
				<div
					className={styles.value}
					style={{ backgroundColor: `${c}` }}
				>
					{v}
				</div>
			</div>
		</div>
	)
}
