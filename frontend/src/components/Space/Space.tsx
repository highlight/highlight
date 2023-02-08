import React from 'react'

import styles from './Space.module.scss'

interface Props {
	direction?: 'horizontal' | 'vertical'
	align?: 'start' | 'end' | 'center'
	size:
		| 'xxSmall'
		| 'xSmall'
		| 'small'
		| 'medium'
		| 'large'
		| 'xLarge'
		| 'xxLarge'
	wrap?: boolean
}

/**
 * Used to add space between children.
 */
const Space: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	direction = 'horizontal',
	align = 'start',
	size,
	wrap = true,
}) => {
	return (
		<div
			className={clsx(styles.space, {
				[styles.alignStart]: align === 'start',
				[styles.alignEnd]: align === 'end',
				[styles.alignCenter]: align === 'center',
				[styles.verticalDirection]: direction === 'vertical',
				[styles.wrap]: wrap,
				[styles.xxSmall]: size === 'xxSmall',
				[styles.xSmall]: size === 'xSmall',
				[styles.small]: size === 'small',
				[styles.medium]: size === 'medium',
				[styles.large]: size === 'large',
				[styles.xLarge]: size === 'xLarge',
				[styles.xxLarge]: size === 'xxLarge',
			})}
		>
			{children}
		</div>
	)
}

export default Space
