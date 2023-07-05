// Light utility to format phone numbers
// If this gets more complex, consider using a library such as https://catamphetamine.gitlab.io/react-phone-number-input
export const formatPhoneNumber = (input: string): string => {
	if (input.startsWith('+')) {
		// Using a country code already, replace all non-digits and re-add the + sign
		return `+${input.replace(/\D/g, '')}`
	}

	// Not using a country code, format to US phone number
	return `+1${input.replace(/\D/g, '')}`
}
