import { MaskInputOptions } from '@highlight-run/rrweb-snapshot'

// returns two values:
// 1. whether all inputs should be masked
// 2. which inputs should be masked

export const determineMaskInputOptions = (
	privacyPolicy: 'strict' | 'default' | 'none',
): [maskAllOptions: boolean, maskOptions?: MaskInputOptions] => {
	switch (privacyPolicy) {
		case 'strict':
			return [true, undefined]
		case 'default':
			return [
				false,
				{
					password: true,
					email: true,
					tel: true,
				},
			]
		case 'none': {
			return [false, { password: true }]
		}
	}
}
