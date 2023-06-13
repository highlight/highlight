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

	return (
		<Form.Input
			name={name}
			placeholder={placeholder}
			type="input"
			color={'n8'}
			value={value}
			style={{
				boxSizing: 'border-box',
				border: 'none',
				background: 'none',
				marginTop: '-5px',
			}}
			onChange={handleDateInput}
		/>
	)
}
