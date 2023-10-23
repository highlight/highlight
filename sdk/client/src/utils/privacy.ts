import { MaskInputOptions } from '@highlight-run/rrweb-snapshot'
import { PrivacySettingOption } from '../types/types'

const DEFAULT_MASK_INPUT_OPTIONS: MaskInputOptions = {
	password: true,
	email: true,
	tel: true,
}

// returns (1) whether all inputs should be masked and (2) which inputs should be masked
export const determineMaskInputOptions = (
	privacyPolicy: PrivacySettingOption,
): [maskAllOptions: boolean, maskOptions?: MaskInputOptions] => {
	switch (privacyPolicy) {
		case 'strict':
			return [true, undefined]
		case 'default':
			return [false, DEFAULT_MASK_INPUT_OPTIONS]
		case 'none': {
			return [false, { password: true }]
		}
	}
}
