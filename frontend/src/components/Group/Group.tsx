import React from 'react'

import styles from './Group.module.css'

const Group: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
	return <div className={styles.group}>{children}</div>
}

export default Group
