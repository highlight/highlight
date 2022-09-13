import randomcolor from 'randomcolor'

export const generateRandomColor = (str: string): string => {
	return randomcolor({
		luminosity: 'dark',
		seed: str,
	})
}
