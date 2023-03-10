import React, { forwardRef, useRef } from 'react'

import {
	Form as AriaKitForm,
	FormProps as AriaKitFormProps,
	FormInput as AriaKitFormInput,
	FormLabel as AriaKitFormLabel,
	FormError as AriaKitFormError,
	FormErrorProps as AriaKitFormErrorProps,
	FormInputProps as AriaKitFormInputProps,
	FormField as AriaKitFormField,
	FormFieldProps as AriaKitFormFieldProps,
	FormState as AriaKitFormState,
	useFormState as useAriaKitFormState,
	FormState as AriakitFormState,
} from 'ariakit/form'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'
import { Button, ButtonProps } from '../Button/Button'
import clsx, { ClassValue } from 'clsx'
import { Variants } from './styles.css'
import { Badge } from '../Badge/Badge'

type FormComponent = React.FC<Props> & {
	Input: typeof Input
	Error: typeof Error
	Submit: typeof Submit
	Field: typeof Field
	NamedSection: typeof NamedSection
}

export const Label = ({
	label,
	name,
}: {
	label: string
	name: AriaKitFormInputProps['name']
}) => {
	return (
		<Box display="flex" alignItems="center" style={{ height: 16 }}>
			<AriaKitFormLabel name={name}>
				<Text
					userSelect="none"
					size="xSmall"
					weight="medium"
					color="weak"
				>
					{label}
				</Text>
			</AriaKitFormLabel>
		</Box>
	)
}

type HasLabel = {
	name: AriaKitFormInputProps['name']
	label?: string
	optional?: boolean
}
export const NamedSection = ({
	children,
	label,
	name,
	optional = false,
}: React.PropsWithChildren<HasLabel>) => {
	return (
		<Box display="flex" flexDirection="column" width="full" gap="4">
			<Box display="flex" flexDirection="row" gap="6">
				{label && <Label label={label} name={name} />}
				{optional && (
					<Badge shape="basic" size="small" label="Optional" />
				)}
			</Box>
			{children}
		</Box>
	)
}

const FormContext = React.createContext<AriakitFormState>(
	{} as AriakitFormState,
)
export const useForm = () => React.useContext(FormContext)

type Props = AriaKitFormProps
export const Form: FormComponent = ({ children, ...props }: Props) => {
	return (
		<FormContext.Provider value={props.state}>
			<AriaKitForm {...props}>{children}</AriaKitForm>
		</FormContext.Provider>
	)
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
			<NamedSection label={label} name={name}>
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
		<NamedSection label={label} name={props.name}>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormState = AriaKitFormState<any>
export const useFormState = useAriaKitFormState
