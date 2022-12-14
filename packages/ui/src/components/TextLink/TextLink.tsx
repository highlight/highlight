import React from 'react'

import * as styles from './styles.css'

type Props = React.PropsWithChildren &
	styles.Variants & {
		href: string
		target?: '_blank'
	}

export const TextLink: React.FC<Props> = ({
	children,
	href,
	underline,
	target,
}) => {
	return (
		<a
			className={styles.variants({ underline })}
			href={href}
			target={target}
		>
			{children}
		</a>
	)
}
