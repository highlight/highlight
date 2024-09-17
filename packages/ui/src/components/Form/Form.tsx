import * as Ariakit from '@ariakit/react'
import clsx, { ClassValue } from 'clsx'
import React, { forwardRef, ReactNode, useRef } from 'react'

import { Badge } from '../Badge/Badge'
import { Box } from '../Box/Box'
import { Button, ButtonProps } from '../Button/Button'
import { IconSolidCheveronDown, IconSolidCheveronUp } from '../icons'
import { OptionProps, SelectProps, Select as UISelect } from '../Select/Select'
import { Stack } from '../Stack/Stack'
import { Text } from '../Text/Text'
import * as styles from './styles.css'
import { Variants } from './styles.css'

type FormComponent = React.FC<Props> & {
	Input: typeof Input
	Error: typeof Error
	Submit: typeof Submit
	Select: typeof Select
	Option: typeof Option
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
								type="button"
								className={styles.inputNumberButton}
								onClick={(e) => {
									const steps = e.shiftKey ? 10 : 1
									inputRef.current?.stepUp(steps)
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
								type="button"
								className={styles.inputNumberButton}
								onClick={(e) => {
									const steps = e.shiftKey ? 10 : 1
									inputRef.current?.stepDown(steps)
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

type FormSelectProps = Ariakit.FormInputProps &
	React.PropsWithChildren<HasLabel> &
	Omit<SelectProps, 'name' | 'onChange'>

export const Select = ({
	children,
	label = '',
	tag,
	optional,
	name,
	options,
	creatable,
	disabled,
	filterable,
	checkType,
	defaultValue,
	displayMode,
	loading,
	trigger,
	onValueChange,
	onCreate,
	renderValue,
	...props
}: FormSelectProps) => {
	const form = Ariakit.useFormContext()!
	const value = props.value ?? form.useValue(name)

	return (
		<Stack direction="column" gap="4">
			{label.trim() !== '' && (
				<Label
					label={label}
					name={name}
					tag={tag}
					optional={optional}
				/>
			)}
			<Ariakit.FormInput
				name={name}
				render={
					<UISelect
						value={value}
						options={options}
						creatable={creatable}
						disabled={disabled}
						filterable={filterable}
						checkType={checkType}
						defaultValue={defaultValue}
						displayMode={displayMode}
						loading={loading}
						trigger={trigger}
						renderValue={renderValue}
						onCreate={onCreate}
						onValueChange={(option) => {
							form.setValue(name, option.value)

							if (onValueChange) {
								onValueChange(option)
							}
						}}
					/>
				}
				{...props}
			>
				{children}
			</Ariakit.FormInput>
		</Stack>
	)
}

export const Option: React.FC<OptionProps> = ({ children, ...props }) => {
	return <UISelect.Option {...props}>{children}</UISelect.Option>
}

Form.Input = Input
Form.Error = Error
Form.Submit = Submit
Form.Label = Label
Form.Select = Select
Form.Option = Option
Form.NamedSection = NamedSection
Form.useStore = Ariakit.useFormStore
Form.useContext = Ariakit.useFormContext

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export declare type FormState<T extends Record<string, any>> =
	Ariakit.FormStore<T>
