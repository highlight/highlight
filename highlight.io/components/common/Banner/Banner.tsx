import React from 'react'
import styles from './Banner.module.scss'

const Banner = ({ children }: React.PropsWithChildren<{}>) => {
	return <div className={styles.banner}>{children}</div>
}

export default Banner
