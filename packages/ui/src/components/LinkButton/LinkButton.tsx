import clsx from 'clsx'
import React from 'react'
import { Box } from '../Box/Box'

import * as buttonStyles from '../Button/styles.css'
import * as styles from './styles.css'

type Props = React.PropsWithChildren &
	Pick<buttonStyles.Variants, 'kind' | 'size' | 'emphasis'> & {
		href: string
	}

export const LinkButton: React.FC<Props> = ({
	children,
	href,
	kind,
	size,
	emphasis,
}) => {
	return (
		<Box
			as="a"
			cssClass={clsx(
				styles.base,
				buttonStyles.variants({
					kind,
					size,
					emphasis,
				}),
			)}
			href={href}
		>
			{children}
		</Box>
	)
}
