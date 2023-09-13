import React, { forwardRef, ReactNode, useRef } from 'react'

import * as Ariakit from '@ariakit/react'

import * as styles from './styles.css'
import { Box } from '../Box/Box'
import { Text } from '../Text/Text'
import { Stack } from '../Stack/Stack'
import { Button, ButtonProps } from '../Button/Button'
import clsx, { ClassValue } from 'clsx'
import { Variants } from './styles.css'
import { Badge } from '../Badge/Badge'
import { Callout } from '../Callout/Callout'

type FormComponent = React.FC<Props> & {
	Input: typeof Input
	Error: typeof Error
	Submit: typeof Submit
	Field: typeof Field
	Select: typeof Select
	NamedSection: typeof NamedSection
	Label: typeof Label
	useFormStore: typeof Ariakit.useFormStore
}

interface LabelProps {
	label: string
	name: Ariakit.FormInputProps['name']
	tag?: ReactNode
	optional?: boolean
}

export const Label: React.FC<LabelProps> = ({ label, name, tag, optional }) => {
	return (
		<Box display="flex" flexDirection="row" gap="6">
			{label && (
				<Box
					display="flex"
					alignItems="center"
					gap="6"
					style={{ height: 16 }}
				>
					<Ariakit.FormLabel name={name}>
						<Text
							userSelect="none"
							size="xSmall"
							weight="medium"
							color="weak"
						>
							{label}
						</Text>
					</Ariakit.FormLabel>
					{tag}
				</Box>
			)}
			{optional && <Badge shape="basic" size="small" label="Optional" />}
		</Box>
	)
}

type HasLabel = {
	name: Ariakit.FormInputProps['name']
	label?: string
	optional?: boolean
	tag?: ReactNode
	icon?: ReactNode
}
export const NamedSection = ({
	children,
	label,
	name,
	tag,
	icon,
	optional = false,
}: React.PropsWithChildren<HasLabel>) => {
	return label ? (
		<Box display="flex" flexDirection="column" width="full" gap="4">
			<Box display="flex" flexDirection="row" gap="6" alignItems="center">
				{label && <Label label={label} name={name} tag={tag} />}
				{optional && (
					<Badge shape="basic" size="small" label="Optional" />
				)}
				{icon}
			</Box>
			{children}
		</Box>
	) : (
		<>{children}</>
	)
}

const FormContext = React.createContext<Ariakit.FormStore>(
	{} as Ariakit.FormStore,
)
export const useForm = () => React.useContext(FormContext)

type Props = Ariakit.FormProps
export const Form: FormComponent = ({ children, ...props }: Props) => {
	return (
		<FormContext.Provider value={props.store}>
			<Ariakit.Form {...props}>{children}</Ariakit.Form>
		</FormContext.Provider>
	)
}

export const Error = ({ ...props }: Ariakit.FormErrorProps) => {
	return <Ariakit.FormError {...props} render={<Box color="bad" />} />
}

export const Submit = ({ ...props }: ButtonProps) => {
	return <Button type="submit" {...props} />
}

export type InputProps = Omit<Ariakit.FormInputProps, 'size'> &
	Variants &
	HasLabel & {
		cssClass?: ClassValue | ClassValue[]
	}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			icon,
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
			<NamedSection label={label} name={name} icon={icon}>
				<Ariakit.FormInput
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
				{/* TODO: Consider adding <Error /> here. */}
			</NamedSection>
		)
	},
)

type FormFieldProps = Ariakit.FormFieldProps &
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
			<Ariakit.FormField
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
			</Ariakit.FormField>
		</NamedSection>
	)
}

type FormSelectProps = Ariakit.FormInputProps &
	React.PropsWithChildren<HasLabel>

export const Select = ({
	children,
	label = '',
	tag,
	optional,
	...props
}: FormSelectProps) => {
	return (
		<Stack direction="column" gap="4">
			<Label
				label={label}
				name={props.name}
				tag={tag}
				optional={optional}
			/>
			<Ariakit.FormInput as="select" className={styles.select} {...props}>
				{children}
			</Ariakit.FormInput>
		</Stack>
	)
}

Form.Input = Input
Form.Error = Error
Form.Submit = Submit
Form.Field = Field
Form.Label = Label
Form.Select = Select
Form.NamedSection = NamedSection

export const useFormStore = Ariakit.useFormStore
Form.useFormStore = useFormStore

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare type FormState<T extends Record<string, any>> =
	Ariakit.FormStore<T>
