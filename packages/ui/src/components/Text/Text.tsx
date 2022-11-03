import React from 'react'
import { Box, Props as BoxProps } from '../Box/Box'
import { Truncate, Props as TruncateProps } from '../private/Truncate/Truncate'

import * as styles from './styles.css'

export type Props = React.PropsWithChildren &
	styles.Variants & {
		as?: BoxProps['as']
		color?: BoxProps['color']
		display?: BoxProps['display']
		lines?: TruncateProps['lines']
		transform?: BoxProps['textTransform']
		userSelect?: BoxProps['userSelect']
	}

export const Text: React.FC<Props> = ({
	as,
	children,
	color,
	display,
	lines,
	transform,
	userSelect,
	...props
}) => {
	const content = lines ? (
		<Truncate lines={lines}>{children}</Truncate>
	) : (
		children
	)

	return (
		<Box
			as={as}
			display={display}
			color={color}
			userSelect={userSelect}
			textTransform={transform}
			cssClass={styles.variants({ ...props })}
		>
			{content}
		</Box>
	)
}
