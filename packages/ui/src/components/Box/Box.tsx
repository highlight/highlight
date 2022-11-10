import clsx, { ClassValue } from 'clsx'
import React from 'react'
import { Sprinkles, sprinkles } from '../../css/sprinkles.css'

export type Props = Sprinkles &
	React.PropsWithChildren &
	Omit<React.AllHTMLAttributes<HTMLElement>, 'color' | 'height' | 'width'> & {
		as?: React.ElementType | string
		// Can't use className because it does some conversion on its values and
		// breaks values like arrays, which would otherwise be valid for clsx.
		cssClass?: ClassValue | ClassValue[]
	}

export type PaddingProps = Pick<
	Props,
	| 'p'
	| 'py'
	| 'px'
	| 'pt'
	| 'pr'
	| 'pb'
	| 'pl'
	| 'padding'
	| 'paddingTop'
	| 'paddingRight'
	| 'paddingBottom'
	| 'paddingLeft'
>

export type MarginProps = Pick<
	Props,
	| 'm'
	| 'my'
	| 'mx'
	| 'mt'
	| 'mr'
	| 'mb'
	| 'ml'
	| 'margin'
	| 'marginTop'
	| 'marginRight'
	| 'marginBottom'
	| 'marginLeft'
>

export const Box = React.forwardRef<unknown, Props>(
	({ as = 'div', cssClass, ...props }, ref) => {
		const sprinklesProps: Record<string, unknown> = {}
		const nativeProps: Record<string, unknown> = {}
		const userClasses = clsx(cssClass)

		for (const key in props) {
			if (sprinkles.properties.has(key as keyof Sprinkles)) {
				sprinklesProps[key] = props[key as keyof typeof props]
			} else {
				nativeProps[key] = props[key as keyof typeof props]
			}
		}

		return React.createElement(as, {
			className: clsx([sprinkles(sprinklesProps), userClasses]),
			ref,
			...nativeProps,
		})
	},
)

// Required because of using forwardRef
Box.displayName = 'Box'
