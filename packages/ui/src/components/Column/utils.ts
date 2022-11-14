// Verified this code works, but can't get types to work and type checks only
// fail on build, not in IDE.
//
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { breakpointNames } from '../../css/breakpoints'
import { BoxProps } from '../Box/Box'
import * as styles from './styles.css'

export const negativeMargin = (space: BoxProps['gap']): string => {
	switch (typeof space) {
		case 'object':
			return breakpointNames
				.map(
					(viewport) =>
						styles.negativeMargins[viewport][space[viewport]],
				)
				.join(' ')
		case 'string':
			return styles.negativeMargins.mobile[space]
		default:
			return ''
	}
}
