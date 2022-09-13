export function getErrorBody(event: any): string {
	try {
		if (Array.isArray(event)) {
			const firstValue = event[0]
			if (typeof firstValue === 'string') {
				if (
					firstValue[0] === '"' &&
					firstValue[firstValue.length - 1] === '"'
				) {
					return firstValue.slice(1, -1)
				}
				return firstValue
			} else if (typeof firstValue === 'object') {
				const values = Object.values(firstValue)

				if (values.length > 0) {
					if (typeof values[0] === 'string') {
						return values[0]
					}
				}
			}
		}
	} catch (e) {
		return event.toString()
	}

	return event.toString()
}
