export const GenerateSecureID = (): string => {
	const ID_LENGTH = 28
	const CHARACTER_SET =
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	var secureID = ''

	const hasCrypto =
		typeof window !== 'undefined' && window.crypto?.getRandomValues
	const cryptoRandom = new Uint32Array(ID_LENGTH)
	if (hasCrypto) {
		window.crypto.getRandomValues(cryptoRandom)
	}

	for (let i = 0; i < ID_LENGTH; i++) {
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
