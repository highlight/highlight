import React from 'react'

import styles from './DashboardInnerTable.module.scss'

export const DashboardInnerTable = ({
	children,
}: React.PropsWithChildren<{}>) => {
	return <div className={styles.card}>{children}</div>
}
