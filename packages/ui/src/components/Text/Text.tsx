import React from 'react'
import { sprinkles } from '../../css/sprinkles.css'
import { Box, Props as BoxProps } from '../Box/Box'

import * as styles from './styles.css'

type Props = React.PropsWithChildren &
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
	if (props.size === 'monospace') {
		props.weight = 'semibold'
	}

	return (
		<Box
			as={as}
			cssclass={[
				styles.variants({ ...props }),
				sprinkles({ color, textTransform: transform }),
			]}
		>
			{children}
		</Box>
	)
}
