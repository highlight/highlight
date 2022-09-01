export function isUrl(input: string): boolean {
	try {
		new URL(input)
		return true
	} catch (error) {
		if (error instanceof TypeError) {
			return false
		}
		throw error
	}
}
