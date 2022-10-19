import clsx, { ClassValue } from 'clsx'
import React from 'react'
import { Sprinkles, sprinkles } from '../../css/sprinkles.css'

export interface Props extends Sprinkles, React.PropsWithChildren {
	as?: React.ElementType
	className?: ClassValue
}

export const Box: React.FC<Props> = ({ as = 'div', ...props }) => {
	const sprinklesProps: Record<string, unknown> = {}
	const nativeProps: Record<string, unknown> = {}
	const userClasses = clsx(props.className)

	for (const key in props) {
		if (sprinkles.properties.has(key as keyof Sprinkles)) {
			sprinklesProps[key] = props[key as keyof typeof props]
		} else {
			nativeProps[key] = props[key as keyof typeof props]
		}
	}

	return React.createElement(as, {
		className: clsx([
			sprinkles({
				background: { darkMode: 'purple900', lightMode: 'white' },
				color: { darkMode: 'white', lightMode: 'black' },
				...sprinklesProps,
			}),
			userClasses,
		]),
		...nativeProps,
	})
}
