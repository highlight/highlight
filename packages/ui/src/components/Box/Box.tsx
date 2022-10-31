import clsx, { ClassValue } from 'clsx'
import React from 'react'
import { Sprinkles, sprinkles } from '../../css/sprinkles.css'

export interface Props extends Sprinkles, React.PropsWithChildren {
	as?: React.ElementType
	// Can't use className because it does some conversion on its values and
	// breaks values like arrays, which would otherwise be valid values for clsx.
	cssClass?: ClassValue | ClassValue[]
}

export const Box: React.FC<Props> = ({ as = 'div', cssClass, ...props }) => {
	const sprinklesProps: Record<string, unknown> = {}
	const nativeProps: Record<string, unknown> = {}
	const userClasses = clsx(cssClass)

	for (const key in props) {
		if (sprinkles.properties.has(key as keyof Sprinkles)) {
			sprinklesProps[key] = props[key]
		} else {
			nativeProps[key] = props[key]
		}
	}

	return React.createElement(as, {
		className: clsx([sprinkles(sprinklesProps), userClasses]),
		...nativeProps,
	})
}
