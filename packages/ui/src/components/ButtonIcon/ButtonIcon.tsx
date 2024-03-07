import clsx, { ClassValue } from 'clsx'
import React, { forwardRef } from 'react'

import { Box } from '../Box/Box'
import { IconProps } from '../icons'
import * as styles from './styles.css'

export type Props = React.ButtonHTMLAttributes<HTMLButtonElement> &
	styles.Variants & {
		icon: React.ReactElement<IconProps>
		cssClass?: ClassValue | ClassValue[]
	}

export const ButtonIcon = forwardRef<HTMLButtonElement, Props>(
	(
		{
			icon,
			kind,
			shape,
			emphasis,
			size,
			onClick,
			disabled,
			cssClass,
			className,
			type = 'button',
		},
		ref,
	) => {
		return (
			<Box
				as="button"
				display="inline-flex"
				cssClass={clsx(
					styles.variants({ kind, shape, emphasis, size }),
					className,
					cssClass,
				)}
				onClick={onClick}
				disabled={disabled}
				type={type}
				ref={ref}
			>
				{icon}
			</Box>
		)
	},
)
