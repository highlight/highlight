import React, { forwardRef, useRef } from 'react'

import {
	Form as AriaKitForm,
	FormProps as AriaKitFormProps,
	FormInput as AriaKitFormInput,
	FormError as AriaKitFormError,
	FormErrorProps as AriaKitFormErrorProps,
	FormInputProps as AriaKitFormInputProps,
	FormField as AriaKitFormField,
	FormFieldProps as AriaKitFormFieldProps,
	useFormState as useAriaKitFormState,
} from 'ariakit/form'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'
import { Button, ButtonProps } from '../Button/Button'
import clsx, { ClassValue } from 'clsx'
import { Variants } from './styles.css'

type FormComponent = React.FC<Props> & {
	Input: typeof Input
	Error: typeof Error
	Submit: typeof Submit
	Field: typeof Field
	NamedSection: typeof NamedSection
}

export const Label = ({ label }: { label: string }) => {
	return (
		<Box display="flex" alignItems="center" style={{ height: 16 }}>
			<Text userSelect="none" size="xSmall" weight="bold" color="weak">
				{label}
			</Text>
		</Box>
	)
}

type HasLabel = { label?: string }
export const NamedSection = ({
	children,
	label,
}: React.PropsWithChildren<HasLabel>) => {
	return (
		<Box display="flex" flexDirection="column" width="full" gap="4">
			{label && <Label label={label} />}
			{children}
		</Box>
	)
}

type Props = AriaKitFormProps
export const Form: FormComponent = ({ children, ...props }: Props) => {
	return <AriaKitForm {...props}>{children}</AriaKitForm>
}

export const Error = ({ ...props }: AriaKitFormErrorProps) => {
	return <AriaKitFormError {...props} />
}

export const Submit = ({ ...props }: ButtonProps) => {
	return <Button type="submit" {...props} />
}

type InputProps = Omit<AriaKitFormInputProps, 'size'> &
	Variants &
	HasLabel & {
		cssClass?: ClassValue | ClassValue[]
	}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{ label, cssClass, size, collapsed, truncate, outline, name, ...props },
		ref,
	) => {
		const _ref = useRef<HTMLInputElement>(null)
		const inputRef = (ref ??
			_ref) as React.MutableRefObject<HTMLInputElement>
		React.useEffect(() => {
			if (collapsed && inputRef.current) {
				inputRef.current.blur()
			}
		}, [collapsed])
		if (inputRef.current && inputRef.current.value) {
			collapsed = false
		}
		return (
			<NamedSection label={label}>
				<AriaKitFormInput
					ref={ref}
					name={name}
					className={clsx(
						styles.inputVariants({
							size,
							collapsed,
							outline,
							truncate,
						}),
						cssClass,
					)}
					{...props}
				/>
			</NamedSection>
		)
	},
)

type FormFieldProps = AriaKitFormFieldProps &
	React.PropsWithChildren &
	Variants &
	HasLabel & {
		cssClass?: ClassValue | ClassValue[]
	}

export const Field = ({
	children,
	label,
	cssClass,
	size,
	collapsed,
	truncate,
	outline,
	...props
}: FormFieldProps) => {
	return (
		<NamedSection label={label}>
			<AriaKitFormField
				className={clsx(
					styles.inputVariants({
						size,
						collapsed,
						outline,
						truncate,
					}),
					cssClass,
				)}
				{...props}
			>
				{children}
			</AriaKitFormField>
		</NamedSection>
	)
}

Form.Input = Input
Form.Error = Error
Form.Submit = Submit
Form.Field = Field
Form.NamedSection = NamedSection

export const useFormState = useAriaKitFormState
