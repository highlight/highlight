import clsx from 'clsx'
import React from 'react'
import { sprinkles } from '../../css/sprinkles.css'
import { Box, Props as BoxProps } from '../Box/Box'

import * as styles from './styles.css'

type Props = React.PropsWithChildren &
	styles.Variants & {
		as?: BoxProps['as']
		color?: BoxProps['color']
	}

export const Text: React.FC<Props> = ({ as, children, color, ...props }) => {
	return (
		<Box
			as={as}
			// TODO: See if we can adapt Box so it can handle clsx input and valid
			// calling it directly here.
			className={clsx([
				styles.variants({ ...props }),
				sprinkles({ color }),
			])}
		>
			{children}
		</Box>
	)
}
