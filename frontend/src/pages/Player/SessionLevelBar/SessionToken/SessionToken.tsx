import React, { ReactElement } from 'react'

import Tooltip from '../../../../components/Tooltip/Tooltip'
import styles from './SessionToken.module.scss'

interface Props {
	icon: React.ReactNode
	tooltipTitle: React.ReactNode
	className?: string
}

function SessionToken({
	icon,
	children,
	tooltipTitle,
	className,
}: React.PropsWithChildren<Props>): ReactElement {
	return (
		<div className={clsx(styles.sessionToken, 'icon', className)}>
			<Tooltip
				title={tooltipTitle}
				arrowPointAtCenter
				placement="bottomRight"
			>
				<span className={styles.iconContainer}>{icon}</span>
			</Tooltip>
			<span>{children}</span>
		</div>
	)
}

export default SessionToken
