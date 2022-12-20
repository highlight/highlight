import React from 'react'
import { Box, BoxProps } from '../Box/Box'

import * as styles from './styles.css'

type Props = React.PropsWithChildren & BoxProps & { centered?: boolean }

export const Container: React.FC<Props> = ({
	children,
	centered = true,
	...props
}) => {
	return (
		<Box
			cssClass={styles.container}
			{...props}
			mx={centered ? 'auto' : undefined}
		>
			{children}
		</Box>
	)
}
