import React from 'react'

import * as styles from './styles.css'

type Props = React.PropsWithChildren &
	styles.Variants & {
		href: string
		target?: '_blank' | '_self'
		rel?: 'noreferrer'
	}

export const TextLink: React.FC<Props> = ({
	children,
	href,
	underline,
	target,
	rel,
	color,
}) => {
	return (
		<a
			className={styles.variants({ underline, color })}
			href={href}
			target={target ?? '_blank'}
			rel={rel ?? 'noreferrer'}
		>
			{children}
		</a>
	)
}
