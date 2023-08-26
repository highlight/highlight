import React, { forwardRef, ReactNode, useRef } from 'react'

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
	Select: typeof Select
	NamedSection: typeof NamedSection
	useFormState: typeof useAriaKitFormState
}

interface LabelProps {
	label: string
	name: AriaKitFormInputProps['name']
	tag?: ReactNode
}

export const Label = ({ label, name, tag }: LabelProps) => {
	return (
		<Box display="flex" alignItems="center" gap="6" style={{ height: 16 }}>
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
			{tag}
		</Box>
	)
}

type HasLabel = {
	name: AriaKitFormInputProps['name']
	label?: string
	optional?: boolean
	tag?: ReactNode
}
export const NamedSection = ({
	children,
	label,
	name,
	tag,
	optional = false,
}: React.PropsWithChildren<HasLabel>) => {
	return label ? (
		<Box display="flex" flexDirection="column" width="full" gap="4">
			<Box display="flex" flexDirection="row" gap="6">
				{label && <Label label={label} name={name} tag={tag} />}
				{optional && (
					<Badge shape="basic" size="small" label="Optional" />
				)}
			</Box>
			{children}
		</Box>
	) : (
		<>{children}</>
	)
}

const FormContext = React.createContext<AriaKitFormState>(
	{} as AriaKitFormState,
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

export type InputProps = Omit<AriaKitFormInputProps, 'size'> &
	Variants &
	HasLabel & {
		cssClass?: ClassValue | ClassValue[]
	}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			cssClass,
			size,
			collapsed,
			truncate,
			outline,
			name,
			rounded,
			...props
		},
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
							rounded,
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

type FormSelectProps = React.DetailedHTMLProps<
	React.SelectHTMLAttributes<HTMLSelectElement>,
	HTMLSelectElement
> &
	React.PropsWithChildren<HasLabel>

export const Select = ({ children, label, ...props }: FormSelectProps) => {
	return (
		<NamedSection label={label} name={props.name}>
			<select className={styles.select} {...props}>
				{children}
			</select>
		</NamedSection>
	)
}

Form.Input = Input
Form.Error = Error
Form.Submit = Submit
Form.Field = Field
Form.Select = Select
Form.NamedSection = NamedSection

export declare type FormState<T> = AriaKitFormState<T>
export const useFormState = useAriaKitFormState
Form.useFormState = useFormState
