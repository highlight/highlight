import { useState } from 'react'

import { Form, InputProps } from '../Form/Form'

export interface TimeInputProps extends InputProps {
	onTimeChange?: (value: string) => void
}

export function TimeInput({ placeholder, name, onTimeChange }: TimeInputProps) {
	const [value, setValue] = useState('')

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
			onChange={(event) => {
				setValue(event.target.value)
				onTimeChange?.(event.target.value)
			}}
		/>
	)
}
