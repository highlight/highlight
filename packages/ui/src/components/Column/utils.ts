import * as styles from './styles.css'

export const negativeMargin = (space: string | object): string => {
	if (typeof space === 'object') {
		const classes = Object.keys(space).map(
			(viewport) => styles.negativeMargins[viewport][space[viewport]],
		)

		return classes.join(' ')
	} else {
		return styles.negativeMargins.mobile[space]
	}
}
