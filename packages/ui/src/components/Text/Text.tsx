import clsx from 'clsx'
import React from 'react'

import { Box, BoxProps } from '../Box/Box'
import { Truncate, Props as TruncateProps } from '../private/Truncate/Truncate'
import * as styles from './styles.css'

export type Props = React.PropsWithChildren &
	styles.Variants & {
		as?: BoxProps['as']
		align?: BoxProps['textAlign']
		color?: BoxProps['color']
		decoration?: BoxProps['textDecoration']
		display?: BoxProps['display']
		lines?: TruncateProps['lines']
		transform?: BoxProps['textTransform']
		userSelect?: BoxProps['userSelect']
		cssClass?: BoxProps['cssClass']
		title?: string
		whiteSpace?: BoxProps['whiteSpace']
		wrap?: BoxProps['overflowWrap']
	}

export const Text = React.forwardRef<unknown, Props>(
	(
		{
			as,
			children,
			color,
			decoration,
			display,
			lines,
			transform,
			userSelect,
			cssClass,
			title,
			whiteSpace,
			wrap,
			...props
		},
		ref,
	) => {
		const content = lines ? (
			<Truncate ref={ref} lines={lines}>
				{children}
			</Truncate>
		) : (
			children
		)

		return (
			<Box
				as={as}
				color={color}
				cssClass={clsx(styles.variants({ ...props }), cssClass)}
				display={display}
				overflowWrap={wrap}
				ref={lines ? undefined : ref}
				textDecoration={decoration}
				textTransform={transform}
				title={title}
				userSelect={userSelect}
				whiteSpace={whiteSpace}
			>
				{content}
			</Box>
		)
	},
)

Text.displayName = 'Text'
