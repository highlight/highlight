export const isJson = (string: string): boolean => {
	try {
		JSON.parse(string)
	} catch (e) {
		return false
	}
	return true
}
