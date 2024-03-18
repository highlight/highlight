import React from 'react'

import { Box, BoxProps } from '../Box/Box'
import * as styles from './styles.css'

type Props = React.PropsWithChildren &
	BoxProps & { centered?: boolean; padded?: boolean }

export const Container: React.FC<Props> = ({
	children,
	centered = true,
	padded = true,
	...props
}) => {
	return (
		<Box cssClass={styles.container}>
			<Box
				cssClass={styles.content}
				px={padded ? '20' : undefined}
				mx={centered ? 'auto' : undefined}
				{...props}
			>
				{children}
			</Box>
		</Box>
	)
}
