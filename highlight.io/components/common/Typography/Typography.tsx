import classNames from 'classnames'
import React from 'react'

import styles from './Typography.module.scss'

export const Typography = ({
	children,
	emphasis = false,
	onDark = false,
	className,
	...props
}: React.PropsWithChildren<{
	type: 'copyHeader' | 'copy1' | 'copy2' | 'copy3' | 'copy4' | 'outline'
	emphasis?: boolean
	onDark?: boolean
	className?: string
}>) => {
	return (
		<span
			{...props}
			className={classNames(className, {
				[styles.copyHeader]: props.type === 'copyHeader',
				[styles.copy1]: props.type === 'copy1',
				[styles.copy2]: props.type === 'copy2',
				[styles.copy3]: props.type === 'copy3',
				[styles.copy4]: props.type === 'copy4',
				[styles.outline]: props.type === 'outline',
				[styles.emphasis]: emphasis,
				[styles.onDark]: onDark,
			})}
		>
			{children}
		</span>
	)
}
