import { useEffect, useState } from 'react'

import { Form, InputProps } from '../Form/Form'

export interface DateInputProps extends InputProps {
	onDateChange: (value: string) => void
}

export function DateInput({ name, onDateChange, placeholder }: DateInputProps) {
	const [value, setValue] = useState(placeholder)
	const handleDateInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const { value } = event.target
		setValue(value)
	}

	const handleSubmit = () => {
		if (value) {
			onDateChange(value)
		}
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
			color="n12"
			value={value}
			style={{
				border: 'none',
				background: 'none',
				fontSize: '13px',
				fontWeight: '500 !important',
				paddingLeft: '6px',
				width: '130px',
			}}
			className="date-input"
			onChange={handleDateInputChange}
			onBlur={handleSubmit}
			onKeyDown={(e) => {
				if (e.key === 'Enter') {
					handleSubmit()
				}
			}}
		/>
	)
}
