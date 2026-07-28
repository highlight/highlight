export const selectValuesToStrings = (values: unknown): string[] => {
	if (!Array.isArray(values)) {
		return []
	}

	return values.map((value) => {
		if (
			value &&
			typeof value === 'object' &&
			'value' in value &&
			value.value !== undefined
		) {
			return String(value.value)
		}

		return String(value)
	})
}
