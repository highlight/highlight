import { useEffect, useState } from 'react'

import { Form, InputProps } from '../Form/Form'

export interface DateInputProps extends InputProps {
	onDateChange?: (value: string) => void
}

export function DateInput({ name, onDateChange, placeholder }: DateInputProps) {
	const [value, setValue] = useState(placeholder)
	const handleDateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = event.target
		setValue(value)
		onDateChange?.(value)
	}

	useEffect(
		function () {
			setValue(placeholder)
		},
		[placeholder],
	)

	const inputClassName = 'date-input'

	return (
		<Form.Input
			name={name}
			placeholder={placeholder}
			type="input"
			color={'n12'}
			value={value}
			style={{
				border: 'none',
				background: 'none',
				marginTop: '-2px',
				fontSize: '13px',
				paddingLeft: '6px',
			}}
			className={inputClassName}
			onChange={handleDateInput}
		/>
	)
}
