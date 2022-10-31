import React from 'react'
import { sprinkles } from '../../css/sprinkles.css'
import { Box, Props as BoxProps } from '../Box/Box'

import * as styles from './styles.css'

export type Props = React.PropsWithChildren &
	styles.Variants & {
		as?: BoxProps['as']
		color?: BoxProps['color']
		transform?: BoxProps['textTransform']
	}

export const Text: React.FC<Props> = ({
	as,
	children,
	color,
	transform,
	...props
}) => {
	return (
		<Box
			as={as}
			cssClass={[
				styles.variants({ ...props }),
				sprinkles({ color, textTransform: transform }),
			]}
		>
			{children}
		</Box>
	)
}
