import React from 'react'

import * as styles from './styles.css'
import * as textStyles from '../Text/styles.css'
import clsx from 'clsx'

type Props = React.PropsWithChildren &
	styles.Variants & {
		href: string
		size?: textStyles.Variants['size']
		weight?: textStyles.Variants['weight']
	}

export const TextLink: React.FC<Props> = ({ children, href, ...props }) => {
	return (
		<a
			className={clsx([styles.variants({ underline: props.underline })])}
			href={href}
		>
			{children}
		</a>
	)
}
