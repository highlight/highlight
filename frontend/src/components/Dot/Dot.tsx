import classNames from 'classnames'
import React from 'react'

import styles from './Dot.module.scss'

export enum CustomDotColor {
	RED,
}

interface Props {
	pulse?: boolean
	className?: string
	color?: CustomDotColor
}

const Dot: React.FC<React.PropsWithChildren<Props>> = ({
	pulse,
	className,
	color,
	children,
}) => {
	return (
		<div
			className={classNames(styles.dot, className, {
				[styles.pulse]: pulse,
				[styles.dotRed]: color === CustomDotColor.RED,
			})}
		>
			{children}
		</div>
	)
}

export default Dot
