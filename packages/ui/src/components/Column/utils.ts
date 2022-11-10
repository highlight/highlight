import * as styles from './styles.css'

export const negativeMargin = (space: string | object) => {
	let className = ''

	if (typeof space === 'string') {
		className = styles.negativeMargins.mobile[space]
	} else if (typeof space === 'object') {
		const classes = []
		Object.keys(space).forEach((viewport) => {
			classes.push(styles.negativeMargins[viewport][space[viewport]])
		})
		className = classes.join(' ')
	}

	return className
}
