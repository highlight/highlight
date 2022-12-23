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
import { Button, Props as ButtonProps } from '../Button/Button'
import clsx from 'clsx'
import { Variants } from './styles.css'

type Props = React.PropsWithChildren<{ state?: AriaKitFormState }>

type FormComponent = React.FC<Props> & {
	Input: typeof Input
	Error: typeof Error
	Submit: typeof Submit
}

export const Form: FormComponent = ({ children, state }: Props) => {
	const form = useFormState({ defaultValues: state })
	return (
		<AriaKitForm state={form}>
			<Box display="flex" flexDirection="column">
				{children}
			</Box>
		</AriaKitForm>
	)
}

export const Error = ({ ...props }: AriaKitFormErrorProps) => {
	return <AriaKitFormError {...props} />
}

export const Submit = ({ ...props }: ButtonProps) => {
	return <Button type="submit" {...props} />
}

type InputProps = Omit<AriaKitFormInputProps, 'size'> &
	Variants & {
		label?: string
	}

export const Input = ({ label, size, collapsed, ...props }: InputProps) => {
	const ref = React.useRef<HTMLInputElement>(null)
	React.useEffect(() => {
		if (collapsed && ref.current) {
			ref.current.blur()
		}
	}, [collapsed])
	if (ref.current && ref.current.value) {
		collapsed = false
	}
	return (
		<Box display={'flex'} flexDirection="column" width="full">
			{label && <Text cssClass={styles.inputLabel}>{label}</Text>}
			<AriaKitFormInput
				ref={ref}
				className={clsx(
					styles.variants({
						size,
						collapsed,
					}),
				)}
				{...props}
			/>
		</Box>
	)
}

Form.Input = Input
Form.Error = Error
Form.Submit = Submit

export const useFormState = useAriaKitFormState
