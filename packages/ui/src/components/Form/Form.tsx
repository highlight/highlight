import * as Ariakit from '@ariakit/react'
import clsx, { ClassValue } from 'clsx'
import React, { forwardRef, ReactNode, useRef } from 'react'

import { Badge } from '../Badge/Badge'
import { Box } from '../Box/Box'
import { Button, ButtonProps } from '../Button/Button'
import { IconSolidCheveronDown, IconSolidCheveronUp } from '../icons'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import * as styles from './styles.css'
import { Variants } from './styles.css'

type FormComponent = React.FC<Props> & {
	Input: typeof Input
	Error: typeof Error
	Submit: typeof Submit
	Field: typeof Field
	Select: typeof Select
	NamedSection: typeof NamedSection
	Label: typeof Label
	useStore: typeof Ariakit.useFormStore
	useContext: typeof Ariakit.useFormContext
}

interface LabelProps {
	label: string
	name: InputProps['name']
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

type Props = Ariakit.FormProps &
	Pick<Ariakit.FormProviderProps, 'defaultValues' | 'store'>

export const Form: FormComponent = ({
	children,
	defaultValues,
	store,
	...props
}: Props) => {
	return (
		<Ariakit.FormProvider defaultValues={defaultValues} store={store}>
			<Ariakit.Form {...props} role="form">
				{children}
			</Ariakit.Form>
		</Ariakit.FormProvider>
	)
}

export const Error = ({ ...props }: Ariakit.FormErrorProps) => {
	return <Ariakit.FormError {...props} render={<Box color="bad" />} />
}

export const Submit: React.FC<Ariakit.FormSubmitProps & ButtonProps> = (
	props,
) => {
	return <Ariakit.FormSubmit render={<Button />} {...props} />
}

export type InputProps = Omit<Ariakit.FormInputProps, 'size'> &
	Variants &
	HasLabel & {
		cssClass?: ClassValue | ClassValue[]
		labelTag?: LabelProps['tag']
	}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			labelTag,
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

		const isNumber = props.type === 'number'
		if (isNumber) {
			props.step = props.step ?? 1
		}

		const emitChange = () => {
			const event = new Event('change', {
				bubbles: true,
			})
			inputRef.current.dispatchEvent(event)
		}

		return (
			<NamedSection label={label} name={name} icon={icon} tag={labelTag}>
				<Box position="relative" flex="stretch">
					<Ariakit.FormInput
						ref={inputRef}
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
							{
								[styles.inputNumber]: isNumber,
							},
						)}
						{...props}
					/>

					{isNumber && (
						<Box
							display="flex"
							position="absolute"
							flexDirection="column"
							style={{ top: 0, right: 0, bottom: 0 }}
						>
							<button
								className={styles.inputNumberButton}
								onClick={() => {
									inputRef.current?.stepUp()
									emitChange()
								}}
							>
								<IconSolidCheveronUp
									size="16"
									className={styles.inputNumberIcon}
								/>
							</button>
							<Box cssClass={styles.inputNumberDivider} />
							<button
								className={styles.inputNumberButton}
								onClick={() => {
									inputRef.current?.stepDown()
									emitChange()
								}}
							>
								<IconSolidCheveronDown
									size="16"
									className={styles.inputNumberIcon}
								/>
							</button>
						</Box>
					)}
				</Box>
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
			<Ariakit.FormInput
				render={<select />}
				className={styles.select}
				{...props}
			>
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
Form.useStore = Ariakit.useFormStore
Form.useContext = Ariakit.useFormContext

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare type FormState<T extends Record<string, any>> =
	Ariakit.FormStore<T>
