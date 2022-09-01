import { Styles } from 'react-select'

export const SharedSelectStyleProps: Styles<
	{ label: string; value: string },
	false
> = {
	control: (provided) => ({
		...provided,
		borderColor: 'var(--color-gray-300)',
		borderRadius: 'var(--border-radius)',
		minHeight: 45,
	}),
	singleValue: (provided) => ({
		...provided,
		maxWidth: 'calc(90% - 8px)',
	}),
	valueContainer: (provided) => ({
		...provided,
		padding: 'var(--size-xSmall) var(--size-medium)',
	}),
	placeholder: (provided) => ({
		...provided,
		color: '#bfbfbf',
	}),
	menu: (provided) => ({ ...provided, zIndex: 100 }),
	option: (provided) => ({
		...provided,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		direction: 'rtl',
		textAlign: 'left',
	}),
}

export const ContainsLabel = (inputValue: string) => {
	return 'Contains: ' + inputValue
}
