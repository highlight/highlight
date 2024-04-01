import clsx, { ClassValue } from 'clsx'
import React from 'react'

import { Sprinkles, sprinkles } from '../../css/sprinkles.css'
import * as styles from './Box.css'

export type BoxProps = Sprinkles &
	React.PropsWithChildren &
	Omit<
		React.AllHTMLAttributes<HTMLElement>,
		'color' | 'height' | 'width' | 'className'
	> & {
		as?: React.ElementType
		// Can't use className because it does some conversion on its values and
		// breaks values like arrays, which would otherwise be valid for clsx.
		cssClass?: ClassValue | ClassValue[]
		hiddenScroll?: boolean
	}

export type PaddingProps = {
	padding?: BoxProps['p']
	paddingTop?: BoxProps['p']
	paddingRight?: BoxProps['p']
	paddingBottom?: BoxProps['p']
	paddingLeft?: BoxProps['p']
	p?: BoxProps['p']
	px?: BoxProps['px']
	py?: BoxProps['py']
}

export const Box = React.forwardRef<unknown, BoxProps>(
	({ as = 'div', cssClass, hiddenScroll, ...props }, ref) => {
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
			className: clsx([
				sprinkles(sprinklesProps),
				userClasses,
				{ [styles.hiddenScroll]: hiddenScroll },
			]),
			ref,
			...nativeProps,
		})
	},
)

// Required because of using forwardRef
Box.displayName = 'Box'
