import React from 'react'

import styles from './LeadAlignLayout.module.scss'

interface Props {
	fullWidth?: boolean
	maxWidth?: number
}

const LeadAlignLayout: React.FC<
	React.PropsWithChildren<Props & { className?: string }>
> = ({ fullWidth = false, maxWidth, children, className }) => {
	return (
		<main
			className={clsx(className, styles.leadAlignLayout, {
				[styles.fullWidth]: fullWidth,
			})}
			style={{ maxWidth: maxWidth }}
		>
			{children}
		</main>
	)
}

export default LeadAlignLayout
