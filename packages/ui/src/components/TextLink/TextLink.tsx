import React from 'react'

import * as styles from './styles.css'

type Props = React.PropsWithChildren &
	styles.Variants & {
		href: string
	}

export const TextLink: React.FC<Props> = ({ children, href, underline }) => {
	return (
		<a className={styles.variants({ underline })} href={href}>
			{children}
		</a>
	)
}
