import React from 'react'

import styles from './Group.module.scss'

const Group: React.FC = ({ children }) => {
	return <div className={styles.group}>{children}</div>
}

export default Group
