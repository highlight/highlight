import React from 'react'

import {
	Form as AriaKitForm,
	FormInput as AriaKitFormInput,
	FormState as AriaKitFormState,
	FormError as AriaKitFormError,
	FormErrorProps as AriaKitFormErrorProps,
	FormInputProps as AriaKitFormInputProps,
	useFormState as useAriaKitFormState,
} from 'ariakit/form'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'
import { Button, HighlightButtonProps } from '../Button/Button'

type Props = React.PropsWithChildren<{ state: AriaKitFormState }>

type FormComponent = React.FC<Props> & {
	Input: typeof Input
	Error: typeof Error
	Submit: typeof Submit
}

export const Form: FormComponent = ({ children, state }: Props) => {
	return (
		<AriaKitForm state={state}>
			<Box display="flex" flexDirection="column">
				{children}
			</Box>
		</AriaKitForm>
	)
}

export const Error = ({ ...props }: AriaKitFormErrorProps) => {
	return <AriaKitFormError {...props} />
}

export const Submit = ({ ...props }: HighlightButtonProps) => {
	return <Button type="submit" {...props} />
}

type InputProps = AriaKitFormInputProps & {
	label?: string
}

export const Input = ({ label, ...props }: InputProps) => {
	return (
		<Box display={'flex'} flexDirection="column" width="full">
			{label && <Text cssClass={styles.inputLabel}>{label}</Text>}
			<AriaKitFormInput className={styles.input} {...props} />
		</Box>
	)
}

Form.Input = Input
Form.Error = Error
Form.Submit = Submit

export const useFormState = useAriaKitFormState
