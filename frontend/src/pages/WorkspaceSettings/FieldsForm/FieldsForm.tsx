import Input from '@components/Input/Input'

import Button from '../../../components/Button/Button/Button'
import { CircularSpinner } from '../../../components/Loading/Loading'
import {
	BaseFieldsForm,
	FormButtonProps,
	FormElementProps,
	FormInputProps,
} from './BaseFieldsForm'

export const FieldsForm = () => {
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

	return <BaseFieldsForm form={form} input={input} button={button} />
}
