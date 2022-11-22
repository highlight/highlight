import Popover from '@components/Popover/Popover'
import { DateInput } from '@components/QueryBuilder/components/DateInput/DateInput'
import FieldMultiselectOption from '@components/QueryBuilder/components/FieldMultiselectOption/FieldMultiselectOption'
import FieldSingleOption from '@components/QueryBuilder/components/FieldSingleOption/FieldSingleOption'
import { LengthInput } from '@components/QueryBuilder/components/LengthInput/LengthInput'
import {
	getFieldDisplayName,
	MultiselectOption,
	OptionKind,
	SelectOption,
} from '@components/QueryBuilder/field'
import { Operator, OperatorName } from '@components/QueryBuilder/operator'
import Tooltip from '@components/Tooltip/Tooltip'
import { Button } from '@highlight-run/ui'
import {
	displayDate,
	displayTime,
	getAbsoluteEndTime,
	getAbsoluteStartTime,
	serializeAbsoluteTimeRange,
} from '@util/time'
import { useMemo, useState } from 'react'
import { components } from 'react-select'
import AsyncSelect from 'react-select/async'
import Creatable from 'react-select/creatable'

const TIME_MAX_LENGTH = 60
const RANGE_MAX_LENGTH = 200

export enum QueryRuleSelectType {
	SINGLE = 'SINGLE',
	MULTI = 'MULTI',
	CREATABLE = 'CREATABLE',
	DATE_RANGE = 'DATE_RANGE',
	TIME_RANGE = 'TIME_RANGE',
	RANGE = 'RANGE',
}

export function pickQueryRuleSelectType(op?: Operator) {
	switch (op?.name) {
		case OperatorName.EXISTS:
		case OperatorName.MATCHES:
			return QueryRuleSelectType.CREATABLE
		case OperatorName.BETWEEN_DATE:
			return QueryRuleSelectType.DATE_RANGE
		case OperatorName.BETWEEN_TIME:
			return QueryRuleSelectType.TIME_RANGE
		case OperatorName.BETWEEN:
			return QueryRuleSelectType.RANGE
		default:
			return QueryRuleSelectType.MULTI
	}
}

export type LoadOptions = (input: string, callback: any) => Promise<any>
export type OnChange = (val?: SelectOption | MultiselectOption) => void

interface Props {
	disabled?: boolean
	type: QueryRuleSelectType
	value?: SelectOption | MultiselectOption
	loadOptions: LoadOptions
	onChange: OnChange
}

const QueryRuleSelect = ({
	value,
	type,
	disabled,
	loadOptions,
	onChange,
	...props
}: Props) => {
	// Visible by default if no value yet
	const [visible, setVisible] = useState(!value)

	const invalid =
		value === undefined ||
		(value?.kind === OptionKind.MULTI && value.options.length === 0)

	const tooltipMessage =
		(value?.kind === OptionKind.MULTI &&
			value.options.map((o) => o.label).join(', ')) ||
		undefined

	const styleProps = {}
	const popoutContent = useMemo(() => {
		switch (type) {
			case QueryRuleSelectType.SINGLE:
				return (
					<AsyncSelect
						autoFocus
						openMenuOnFocus
						value={value?.kind === OptionKind.SINGLE ? value : null}
						styles={styleProps}
						loadOptions={loadOptions}
						defaultOptions
						menuIsOpen
						controlShouldRenderValue={false}
						hideSelectedOptions={false}
						isClearable={false}
						components={{
							DropdownIndicator: () => null,
							IndicatorSeparator: () => null,
							Menu: (props) => {
								return (
									<components.MenuList
										// className={styles.menuListContainer}
										maxHeight={400}
										{...props}
									/>
								)
							},
							Option: FieldSingleOption,
						}}
						noOptionsMessage={({ inputValue }) =>
							`No results for "${inputValue}"`
						}
						onChange={(item) => {
							onChange(
								!!item
									? { kind: OptionKind.SINGLE, ...item }
									: undefined,
							)
							setVisible(false)
						}}
						{...props}
					/>
				)
			case QueryRuleSelectType.MULTI:
				const selected =
					(value?.kind === OptionKind.MULTI ? value.options : null) ??
					[]
				return (
					<AsyncSelect
						autoFocus
						openMenuOnFocus
						isMulti
						value={selected}
						styles={styleProps}
						loadOptions={(input, callback) => {
							const selectedSet = new Set(
								selected.map((s) => s.value),
							)
							return loadOptions(input, callback).then(
								(results) => [
									...selected,
									...results.filter(
										(r: any) => !selectedSet.has(r.value),
									),
								],
							)
						}}
						defaultOptions
						menuIsOpen
						controlShouldRenderValue={false}
						hideSelectedOptions={false}
						isClearable={false}
						components={{
							DropdownIndicator: () => null,
							IndicatorSeparator: () => null,
							Menu: (props) => {
								return (
									<components.MenuList
										// className={styles.menuListContainer}
										maxHeight={400}
										{...props}
									/>
								)
							},
							Option: FieldMultiselectOption,
							LoadingIndicator: () => {
								return <></>
							},
						}}
						noOptionsMessage={({ inputValue }) =>
							`No results for "${inputValue}"`
						}
						onChange={(item) => {
							onChange(
								!!item
									? {
											kind: OptionKind.MULTI,
											options: item as readonly {
												label: string
												value: string
											}[],
									  }
									: undefined,
							)
							if (value === undefined) {
								setVisible(false)
							}
						}}
						{...props}
					/>
				)
			case QueryRuleSelectType.CREATABLE:
				const created =
					(value?.kind === OptionKind.MULTI ? value.options : null) ??
					[]
				return (
					<Creatable
						autoFocus
						openMenuOnFocus
						isMulti
						value={created}
						styles={styleProps}
						options={created}
						defaultOptions
						menuIsOpen
						controlShouldRenderValue={false}
						hideSelectedOptions={false}
						isClearable={false}
						filterOption={() => true}
						components={{
							DropdownIndicator: () => null,
							IndicatorSeparator: () => null,
							Menu: (props) => {
								return (
									<components.MenuList
										// className={styles.menuListContainer}
										maxHeight={400}
										{...props}
									/>
								)
							},
							Option: FieldMultiselectOption,
						}}
						noOptionsMessage={() => null}
						onChange={(item) => {
							onChange(
								!!item
									? {
											kind: OptionKind.MULTI,
											options: item as readonly {
												label: string
												value: string
											}[],
									  }
									: undefined,
							)
							setVisible(false)
						}}
						formatCreateLabel={(label) => label}
						createOptionPosition="first"
						allowCreateWhileLoading={false}
						{...props}
					/>
				)
			case QueryRuleSelectType.DATE_RANGE:
				return (
					<DateInput
						startDate={
							value?.kind === OptionKind.MULTI
								? new Date(
										getAbsoluteStartTime(
											value.options[0]?.value,
										)!,
								  )
								: undefined
						}
						endDate={
							value?.kind === OptionKind.MULTI
								? new Date(
										getAbsoluteEndTime(
											value.options[0]?.value,
										)!,
								  )
								: undefined
						}
						onChange={(start, end) => {
							const value = serializeAbsoluteTimeRange(start, end)

							onChange({
								kind: OptionKind.MULTI,
								options: [
									{
										label: displayDate(value),
										value: value,
									},
								],
							})
							setVisible(false)
						}}
					/>
				)
			case QueryRuleSelectType.TIME_RANGE:
				return (
					<LengthInput
						type={type}
						start={
							value?.kind === OptionKind.MULTI
								? Number(value.options[0]?.value.split('_')[0])
								: 0
						}
						end={
							value?.kind === OptionKind.MULTI
								? Number(value.options[0]?.value.split('_')[1])
								: TIME_MAX_LENGTH
						}
						max={TIME_MAX_LENGTH}
						onChange={(start, end) => {
							const value = `${start}_${end}`

							onChange({
								kind: OptionKind.MULTI,
								options: [
									{
										label: displayTime(value),
										value,
									},
								],
							})
							setVisible(false)
						}}
					/>
				)
			case QueryRuleSelectType.RANGE:
				return (
					<LengthInput
						type={type}
						start={
							value?.kind === OptionKind.MULTI
								? Number(value.options[0]?.value.split('_')[0])
								: 0
						}
						end={
							value?.kind === OptionKind.MULTI
								? Number(value.options[0]?.value.split('_')[1])
								: RANGE_MAX_LENGTH
						}
						max={RANGE_MAX_LENGTH}
						onChange={(start, end) => {
							const value = `${start}_${end}`

							onChange({
								kind: OptionKind.MULTI,
								options: [
									{
										label: displayLength(value),
										value,
									},
								],
							})
							setVisible(false)
						}}
					/>
				)
		}
	}, [loadOptions, onChange, props, styleProps, type, value])

	return (
		<Popover
			trigger="click"
			content={popoutContent}
			placement="bottomLeft"
			// contentContainerClassName={styles.contentContainer}
			// popoverClassName={styles.popoverContainer}
			onVisibleChange={(isVisible) => {
				setVisible(isVisible)
			}}
			visible={visible}
			destroyTooltipOnHide
		>
			<Tooltip
				title={tooltipMessage}
				mouseEnterDelay={1.5}
				overlayStyle={{ maxWidth: '50vw', fontSize: '12px' }}
			>
				<Button disabled={disabled}>
					{invalid && '--'}
					{value?.kind === OptionKind.SINGLE &&
						getFieldDisplayName(value)}
					{value?.kind === OptionKind.MULTI &&
						value.options.length > 1 &&
						`${value.options.length} selections`}
					{value?.kind === OptionKind.MULTI &&
						value.options.length === 1 &&
						value.options[0].label}
				</Button>
			</Tooltip>
		</Popover>
	)
}

const displayLength = (value: string): string => {
	const split = value.split('_')
	const start = Number(split[0])
	const end = Number(split[1])
	return `${start} and ${end}`
}

export default QueryRuleSelect
