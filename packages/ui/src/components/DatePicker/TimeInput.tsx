import { useState } from 'react'

import { Form, InputProps } from '../Form/Form'

export interface TimeInputProps extends InputProps {
	onTimeChange: (value: string) => void
}

export function TimeInput({ placeholder, name, onTimeChange }: TimeInputProps) {
	const [value, setValue] = useState('')
	const handleTimeInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const { value } = event.target
		setValue(value)
	}

	const handleBlur = () => {
		if (value) {
			onTimeChange(value)
		}
	}

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
			onChange={handleTimeInputChange}
			onBlur={handleBlur}
		/>
	)
}
