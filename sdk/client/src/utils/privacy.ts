import { MaskInputOptions } from '@highlight-run/rrweb-snapshot'
import { PrivacySettingOption } from '../types/types'

const DEFAULT_MASK_INPUT_OPTIONS: MaskInputOptions = {
	password: true,
	email: true,
	tel: true,
	name: true,
	'given-name': true,
	'family-name': true,
	'additional-name': true,
	'one-time-code': true,
	'street-address': true,
	address: true,
	'address-line1': true,
	'address-line2': true,
	'address-line3': true,
	'address-level4': true,
	'address-level3': true,
	'address-level2': true,
	'address-level1': true,
	city: true,
	state: true,
	country: true,
	zip: true,
	'country-name': true,
	'postal-code': true,
	'cc-name': true,
	'cc-given-name': true,
	'cc-additional-name': true,
	'cc-family-name': true,
	'cc-number': true,
	'cc-exp': true,
	'cc-exp-month': true,
	'cc-exp-year': true,
	'cc-csc': true,
	'cc-type': true,
	bday: true,
	'bday-day': true,
	'bday-month': true,
	'bday-year': true,
	sex: true,
	'tel-country-code': true,
	'tel-national': true,
	'tel-area-code': true,
	'tel-local': true,
	'tel-extension': true,
	ssn: true,
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
