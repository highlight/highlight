import classNames from 'classnames'
import React from 'react'

import styles from './ActivityIcon.module.scss'

interface Props {
	isActive: boolean
}

const ActivityIcon = ({
	isActive,
	...props
}: React.HTMLAttributes<HTMLDivElement> & Props) => {
	return (
		<div
			{...props}
			className={classNames(
				styles.activityIcon,
				{
					[styles.active]: isActive,
				},
				props.className,
			)}
		></div>
	)
}

export default ActivityIcon
