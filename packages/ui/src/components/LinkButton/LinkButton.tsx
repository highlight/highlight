import clsx from 'clsx'
import React from 'react'
import { Box } from '../Box/Box'
import { IconProps } from '../icons'
import { Link, LinkProps } from 'react-router-dom'

import * as buttonStyles from '../Button/styles.css'
import * as styles from './styles.css'

type Props = React.PropsWithChildren &
	buttonStyles.Variants & {
		to: LinkProps['to']
		disabled?: boolean
		iconLeft?: React.ReactElement<IconProps>
		iconRight?: React.ReactElement<IconProps>
	}

export const LinkButton: React.FC<Props> = ({
	children,
	disabled,
	to,
	kind,
	size,
	emphasis,
	iconLeft,
	iconRight,
}) => {
	const Component = disabled ? DisabledLink : Link

	return (
		<Component
			to={disabled ? undefined : to}
			className={clsx(
				styles.base,
				buttonStyles.variants({
					kind,
					size,
					emphasis,
				}),
			)}
		>
			{iconLeft && (
				<Box
					as="span"
					display="inline-flex"
					className={buttonStyles.iconVariants({
						kind,
						size,
						emphasis,
					})}
				>
					{iconLeft}
				</Box>
			)}
			{children}
			{iconRight && (
				<Box
					as="span"
					display="inline-flex"
					className={buttonStyles.iconVariants({
						kind,
						size,
						emphasis,
					})}
				>
					{iconRight}
				</Box>
			)}
		</Component>
	)
}

const DisabledLink: React.FC<Props> = ({ children, ...props }) => (
	<button disabled aria-disabled {...props}>
		{children}
	</button>
)
