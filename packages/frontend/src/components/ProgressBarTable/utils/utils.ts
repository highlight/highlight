/**
 * Returns `< 1%` for values smaller than 1.
 * @param percent The percent value, use 0.95 instead of 95.
 */
export const getPercentageDisplayValue = (percent: number) => {
	if (percent < 0.1) {
		return '<1%'
	}

	return `${(percent * 100).toFixed(0)}%`
}
