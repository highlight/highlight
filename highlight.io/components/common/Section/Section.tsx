import classNames from 'classnames'
import React from 'react'

import styles from './Section.module.scss'

export const Section = ({
	reverseMobile,
	className,
	children,
	noYBottomPadding,
	noYTopPadding,
	grid,
	...props
}: React.PropsWithChildren<{
	reverseMobile?: boolean
	className?: string
	noYTopPadding?: boolean
	noYBottomPadding?: boolean
	grid?: boolean
}>) => {
	return (
		<div
			{...props}
			className={classNames(className, styles.section, {
				[styles.sectionReverseMobile]: reverseMobile,
				[styles.noYTopPadding]: noYTopPadding,
				[styles.noYBottomPadding]: noYBottomPadding,
				[styles.gridSection]: grid,
			})}
		>
			{children}
		</div>
	)
}
