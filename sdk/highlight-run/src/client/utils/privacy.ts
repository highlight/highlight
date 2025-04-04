import { MaskInputOptions } from 'rrweb-snapshot'
import { PrivacySettingOption } from '../types/types'

// returns (1) whether all inputs should be masked and (2) which inputs should be masked
export const determineMaskInputOptions = (
	privacyPolicy: PrivacySettingOption,
): [maskAllOptions: boolean, maskOptions?: MaskInputOptions] => {
	switch (privacyPolicy) {
		case 'strict':
			return [true, undefined]
		case 'default':
			return [true, undefined]
		case 'none': {
			return [false, { password: true }]
		}
	}
}
