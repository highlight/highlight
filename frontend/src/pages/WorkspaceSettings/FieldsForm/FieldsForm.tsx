import Input from '@components/Input/Input'
import React from 'react'

import Button from '../../../components/Button/Button/Button'
import { CircularSpinner } from '../../../components/Loading/Loading'
import {
	BaseFieldsForm,
	FormButtonProps,
	FormElementProps,
	FormInputProps,
} from './BaseFieldsForm'
type Props = {
	defaultName?: string | null
	defaultEmail?: string | null
	disabled?: boolean
}

export const FieldsForm: React.FC<Props> = ({
	defaultName,
	defaultEmail,
	disabled,
}) => {
	const form: React.FC<FormElementProps> = (props) => <form {...props} />
	const input: React.FC<FormInputProps> = ({ name, ...props }) => (
		<Input name={name || ''} {...props} />
	)
	const button: React.FC<FormButtonProps> = ({
		isSubmitting,
		type,
		...props
	}) => (
		<Button
			trackingId="WorkspaceUpdate"
			htmlType={type}
			type="primary"
			{...props}
		>
			{isSubmitting ? (
				<CircularSpinner
					style={{
						fontSize: 18,
						color: 'var(--text-primary-inverted)',
					}}
				/>
			) : (
				'Save'
			)}
		</Button>
	)

	return (
		<BaseFieldsForm
			defaultEmail={defaultEmail}
			defaultName={defaultName}
			form={form}
			input={input}
			button={button}
			disabled={disabled}
		/>
	)
}
