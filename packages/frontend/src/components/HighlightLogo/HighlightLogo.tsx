import React from 'react'

import { ReactComponent as HighlightLogoSmall } from '../../static/highlight-logo-small.svg'
import styles from './HighlightLogo.module.scss'

export const HighlightLogo = () => {
	return (
		<>
			<HighlightLogoSmall className={styles.logo} />
			<span className={styles.logoText}>Highlight</span>
		</>
	)
}
