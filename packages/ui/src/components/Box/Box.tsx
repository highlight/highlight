import clsx, { ClassValue } from 'clsx'
import React from 'react'
import { base } from '../../css/reset.css'
import { Sprinkles, sprinkles } from '../../css/sprinkles.css'

interface Props extends Sprinkles, React.PropsWithChildren {
	as?: React.ElementType
	className?: ClassValue
}

const Box: React.FC<Props> = ({ as = 'div', children, className, ...rest }) => {
	const Component = as
	const userClasses = clsx(className)

	return (
		<Component
			className={clsx([
				base, // TODO: Consider resetting globally
				sprinkles({
					background: { darkMode: 'purple900', lightMode: 'white' },
					color: { darkMode: 'white', lightMode: 'black' },
					...rest,
				}),
				userClasses,
			])}
		>
			{children}
		</Component>
	)
}

export default Box
