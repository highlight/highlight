import { ButtonProps } from '@components/Button'
import { ButtonContent, buttonStyles } from '@highlight-run/ui'
import analytics from '@util/analytics'
import clsx from 'clsx'
import React from 'react'
import { Link, LinkProps } from 'react-router-dom'

import * as styles from './styles.css'

type Props = React.PropsWithChildren &
	Pick<
		ButtonProps,
		| 'disabled'
		| 'kind'
		| 'size'
		| 'emphasis'
		| 'iconLeft'
		| 'iconRight'
		| 'trackingId'
		| 'trackingProperties'
	> & {
		to: LinkProps['to']
		state?: LinkProps['state']
		target?: LinkProps['target']
	}

export const LinkButton: React.FC<Props> = ({
	children,
	disabled,
	to,
	state,
	kind,
	size,
	emphasis,
	iconLeft,
	iconRight,
	target,
	trackingId,
	trackingProperties,
}) => {
	const Component = disabled ? DisabledLink : Link

	return (
		<Component
			to={to}
			state={state}
			target={target}
			className={clsx(
				styles.base,
				buttonStyles.variants({
					kind,
					size,
					emphasis,
				}),
			)}
			onClick={(e) => {
				e.stopPropagation()
				analytics.track(trackingId, trackingProperties)
			}}
		>
			<ButtonContent
				iconLeft={iconLeft}
				iconRight={iconRight}
				kind={kind}
				size={size}
				emphasis={emphasis}
			>
				{children}
			</ButtonContent>
		</Component>
	)
}

const DisabledLink: React.FC<
	React.PropsWithChildren<{ className: string; to?: unknown }>
> = ({ children, className }) => (
	<button disabled aria-disabled className={className}>
		{children}
	</button>
)
