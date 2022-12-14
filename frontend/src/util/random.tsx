const CHARACTER_SET =
	'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
export const GenerateSecureRandomString = (length = 32): string => {
	let secureID = ''

	const hasCrypto =
		typeof window !== 'undefined' && window.crypto?.getRandomValues
	const cryptoRandom = new Uint32Array(length)
	if (hasCrypto) {
		window.crypto.getRandomValues(cryptoRandom)
	}

	for (let i = 0; i < length; i++) {
		if (hasCrypto) {
			secureID += CHARACTER_SET.charAt(
				cryptoRandom[i] % CHARACTER_SET.length,
			)
		} else {
			secureID += CHARACTER_SET.charAt(
				Math.floor(Math.random() * CHARACTER_SET.length),
			)
		}
	}

	return secureID
}
