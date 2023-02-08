import clsx from 'clsx'
import React from 'react'
import { Box, BoxProps } from '../Box/Box'
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
		cssClass?: BoxProps['cssClass']
		title?: string
		wrap?: BoxProps['overflowWrap']
	}

export const Text = React.forwardRef<unknown, Props>(
	(
		{
			as,
			children,
			color,
			display,
			lines,
			transform,
			userSelect,
			cssClass,
			title,
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
				display={display}
				color={color}
				ref={lines ? undefined : ref}
				userSelect={userSelect}
				textTransform={transform}
				cssClass={clsx(styles.variants({ ...props }), cssClass)}
				title={title}
				overflowWrap={wrap}
			>
				{content}
			</Box>
		)
	},
)

Text.displayName = 'Text'
