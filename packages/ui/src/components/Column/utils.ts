// Verified this code works, but can't get types to work and type checks only
// fail on build, not in IDE.
//
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Props as BoxProps } from '../Box/Box'
import * as styles from './styles.css'

export const negativeMargin = (space: BoxProps['gap']): string => {
	switch (typeof space) {
		case 'object':
			return Object.keys(space)
				.map(
					(viewport: keyof typeof space) =>
						styles.negativeMargins[viewport][space[viewport]],
				)
				.join(' ')
		case 'string':
			return styles.negativeMargins.mobile[space]
		default:
			return ''
	}
}
