import React from 'react'

import styles from './RightPanelCard.module.scss'

type Props = {
	selected: boolean
	/**
	 * The color used for the border and icons.
	 */
	primaryColor: string
} & React.HTMLProps<HTMLDivElement>

const RightPanelCard: React.FC<React.PropsWithChildren<Props>> = ({
	children,
	selected,
	primaryColor,
	...props
}) => {
	return (
		<article
			{...props}
			className={clsx(styles.card, props.className, {
				[styles.selected]: selected,
			})}
			style={
				{
					'--primary-color': `var(${primaryColor})`,
				} as React.CSSProperties
			}
		>
			{children}
		</article>
	)
}

export default RightPanelCard
