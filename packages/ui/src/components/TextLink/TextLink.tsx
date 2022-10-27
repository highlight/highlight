import React from 'react'

import * as styles from './styles.css'

type Props = React.PropsWithChildren &
	styles.Variants & {
		href: string
	}

export const TextLink: React.FC<Props> = ({ children, href, ...props }) => {
	return (
		<a className={styles.variants({ ...props })} href={href}>
			{children}
		</a>
	)
}
