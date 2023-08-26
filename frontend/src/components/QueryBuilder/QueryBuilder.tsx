import { Button } from '@components/Button'
import InfoTooltip from '@components/InfoTooltip/InfoTooltip'
import Popover from '@components/Popover/Popover'
import { Skeleton } from '@components/Skeleton/Skeleton'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import Tooltip from '@components/Tooltip/Tooltip'
import { BaseSearchContext } from '@context/BaseSearchContext'
import {
	useEditErrorSegmentMutation,
	useEditSegmentMutation,
	useGetAppVersionsQuery,
	useGetErrorSegmentsQuery,
	useGetSegmentsQuery,
} from '@graph/hooks'
import { GetFieldTypesQuery, namedOperations } from '@graph/operations'
import { ErrorSegment, Exact, Field, Segment } from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	defaultPresets,
	getNow,
	IconSolidCheveronDown,
	IconSolidCloudUpload,
	IconSolidDocumentDuplicate,
	IconSolidLogout,
	IconSolidPencil,
	IconSolidPlusCircle,
	IconSolidPlusSm,
	IconSolidRefresh,
	IconSolidSave,
	IconSolidSegment,
	IconSolidTrash,
	IconSolidX,
	Menu,
	PreviousDateRangePicker,
	Tag,
	Text,
} from '@highlight-run/ui'
import { colors } from '@highlight-run/ui/src/css/colors'
import { SharedSelectStyleProps } from '@pages/Sessions/SearchInputs/SearchInputUtil'
import { DateInput } from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/components/DateInput/DateInput'
import { LengthInput } from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/components/LengthInput/LengthInput'
import { formatNumber } from '@util/numbers'
import { useParams } from '@util/react-router/useParams'
import { roundFeedDate, serializeAbsoluteTimeRange } from '@util/time'
import { Checkbox, message } from 'antd'
import clsx, { ClassValue } from 'clsx'
import { isEqual } from 'lodash'
import moment, { unitOfTime } from 'moment'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { components } from 'react-select'
import AsyncSelect from 'react-select/async'
import Creatable from 'react-select/creatable'
import { Styles } from 'react-select/src/styles'
import { OptionTypeBase } from 'react-select/src/types'
import { useLocalStorage, useToggle } from 'react-use'

import { useAuthContext } from '@/authentication/AuthContext'
import CreateErrorSegmentModal from '@/pages/Errors/ErrorSegmentSidebar/SegmentButtons/CreateErrorSegmentModal'
import DeleteErrorSegmentModal from '@/pages/Errors/ErrorSegmentSidebar/SegmentPicker/DeleteErrorSegmentModal/DeleteErrorSegmentModal'
import CreateSegmentModal from '@/pages/Sessions/SearchSidebar/SegmentButtons/CreateSegmentModal'
import DeleteSessionSegmentModal from '@/pages/Sessions/SearchSidebar/SegmentPicker/DeleteSessionSegmentModal/DeleteSessionSegmentModal'

import { DropdownMenu } from '../../pages/Sessions/SessionsFeedV3/SessionQueryBuilder/components/SessionFeedConfigurationV2/SessionFeedConfigurationV2'
import * as newStyle from './QueryBuilder.css'
import styles from './QueryBuilder.module.css'
export interface RuleProps {
	field: SelectOption | undefined
	op: Operator | undefined
	val: MultiselectOption | undefined
}

export interface SelectOption {
	kind: 'single'
	label: string
	value: string
}
export interface MultiselectOption {
	kind: 'multi'
	options: readonly {
		label: string
		value: string
	}[]
}

type OnChangeInput = SelectOption | MultiselectOption | undefined
type OnChange = (val: OnChangeInput) => void
type LoadOptions = (input: string, callback: any) => Promise<any>

interface RuleSettings {
	onChangeKey: OnChange
	getKeyOptions: LoadOptions
	onChangeOperator: OnChange
	getOperatorOptions: LoadOptions
	onChangeValue: OnChange
	getValueOptions: LoadOptions
	onRemove: () => void
	readonly: boolean
}

type PopoutType =
	| 'select'
	| 'multiselect'
	| 'creatable'
	| 'date_range'
	| 'time_range'
	| 'range'
interface PopoutContentProps {
	type: PopoutType
	value: OnChangeInput
	onChange: OnChange
	loadOptions: LoadOptions
}

interface PopoutProps {
	disabled: boolean
}

interface SetVisible {
	setVisible: (val: boolean) => void
}

export const TIME_MAX_LENGTH = 60
export const RANGE_MAX_LENGTH = 200

const TOOLTIP_MESSAGE = 'This property was automatically collected by Highlight'

const styleProps: Styles<{ label: string; value: string }, false> = {
	...SharedSelectStyleProps,
	option: (provided, { isFocused }) => ({
		...provided,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		direction: 'ltr',
		textAlign: 'left',
		padding: '0 0 0 12px',
		marginRight: '12px',
		fontSize: '12px',
		color: 'var(--color-text-primary)',
		backgroundColor: isFocused ? 'var(--color-gray-200)' : 'none',
		'&:active': {
			backgroundColor: 'var(--color-gray-200)',
		},
	}),
	menuList: (provided) => ({
		...provided,
		scrollbarWidth: 'none',
		padding: '0',
		'&::-webkit-scrollbar': {
			display: 'none',
		},
		maxHeight: '400px',
	}),
	control: (provided) => ({
		...provided,
		border: '0',
		boxShadow: '0',
		fontSize: '12px',
		background: 'none',
		'border-radius': '0',
		'border-bottom': '1px solid var(--color-gray-300)',
		'&:hover': {
			'border-bottom': '1px solid var(--color-gray-300)',
		},
	}),
	valueContainer: (provided) => ({
		...provided,
		padding: '8px 12px',
	}),
	noOptionsMessage: (provided) => ({
		...provided,
		fontSize: '12px',
	}),
	loadingMessage: (provided) => ({
		...provided,
		fontSize: '12px',
	}),
}

function useScroll<T extends HTMLElement>(): [() => void, React.RefObject<T>] {
	const ref = useRef<T>(null)
	const doScroll = useCallback(() => {
		ref?.current?.scrollIntoView({ inline: 'center' })
	}, [])

	return [doScroll, ref]
}

const OptionLabelName: React.FC<React.PropsWithChildren> = (props) => {
	const ref = useRef<HTMLDivElement>(null)

	const [className, setClassName] = useState<string>(styles.shadowContainer)

	const setScrollShadow = (target: any) => {
		const { scrollLeft, offsetWidth, scrollWidth } = target
		const showRightShadow = scrollLeft + offsetWidth < scrollWidth
		const showLeftShadow = scrollLeft > 0
		setClassName(
			clsx(styles.shadowContainer, {
				[styles.shadowRight]: showRightShadow && !showLeftShadow,
				[styles.shadowLeft]: showLeftShadow && !showRightShadow,
				[styles.shadowBoth]: showLeftShadow && showRightShadow,
			}),
		)
	}

	useEffect(() => {
		if (!!ref?.current) {
			setScrollShadow(ref.current)
			const onScroll = (ev: any) => {
				setScrollShadow(ev.target)
			}
			ref.current.removeEventListener('scroll', onScroll)
			ref.current.addEventListener('scroll', onScroll, { passive: true })
			return () => window.removeEventListener('scroll', onScroll)
		}
	}, [ref])

	return (
		<div className={styles.shadowParent}>
			<div className={className} />
			<div className={styles.optionLabelName} ref={ref}>
				{props.children}
			</div>
		</div>
	)
}

const ScrolledTextHighlighter = ({
	searchWords,
	textToHighlight,
}: {
	searchWords: string[]
	textToHighlight: string
}) => {
	const [memoText, setMemoText] = useState<string>(textToHighlight)
	if (!isEqual(memoText, textToHighlight)) {
		setMemoText(textToHighlight)
	}
	const [doScroll, ref] = useScroll()

	useEffect(() => {
		doScroll()
	}, [doScroll, textToHighlight])

	const ScrolledMark = (props: any) => {
		if (props.highlightIndex === 0) {
			// Attach the ref to the first matching instance
			return (
				<mark className={styles.highlighterStyles} ref={ref}>
					{props.children}
				</mark>
			)
		} else {
			return (
				<mark className={styles.highlighterStyles}>
					{props.children}
				</mark>
			)
		}
	}

	return (
		<TextHighlighter
			highlightTag={ScrolledMark}
			searchWords={searchWords}
			textToHighlight={textToHighlight}
		/>
	)
}
const getDateLabel = (value: string): string => {
	if (!value.includes('_')) {
		// Value is a duration such as '7 days'
		return 'Last ' + value
	}
	const split = value.split('_')
	const start = split[0]
	const end = split[1]
	const startStr = moment(start).format('MMM D h:mm a')
	const endStr = moment(end).format('MMM D h:mm a')
	return `${startStr} to ${endStr}`
}

export const updateQueriedTimeRange = (
	query: string,
	timeRangeField: SelectOption,
	serializedValue: string,
): string => {
	const parsedQuery = JSON.parse(query) as QueryBuilderState
	parsedQuery.rules = parsedQuery.rules.map((rule) => {
		if (rule[0] === timeRangeField.value) {
			rule[2] = serializedValue
		}
		return rule
	})
	return JSON.stringify(parsedQuery)
}

export const isAbsoluteTimeRange = (value?: string): boolean => {
	return !!value && value.includes('_')
}

export const getAbsoluteStartTime = (value?: string): string | null => {
	if (!value) return null
	if (!isAbsoluteTimeRange(value)) {
		// value is a relative duration such as '7 days', subtract it from current time
		const amount = parseInt(value.split(' ')[0])
		const unit = value.split(' ')[1].toLowerCase()
		return roundFeedDate(
			moment()
				.subtract(amount, unit as unitOfTime.DurationConstructor)
				.toISOString(),
		).toISOString()
	}
	return value!.split('_')[0]
}
export const getAbsoluteEndTime = (value?: string): string | null => {
	if (!value) return null
	if (!isAbsoluteTimeRange(value)) {
		// value is a relative duration such as '7 days', use current time as end of range
		return roundFeedDate(moment().toISOString()).toISOString()
	}
	return value!.split('_')[1]
}

const getTimeLabel = (value: string): string => {
	const split = value.split('_')
	const start = Number(split[0])
	const end = Number(split[1])
	const ints = Number.isInteger(start) && Number.isInteger(end)
	return ints
		? `${start} and ${end} minutes`
		: `${start * 60} and ${end * 60} seconds`
}

const getLengthLabel = (value: string): string => {
	const split = value.split('_')
	const start = Number(split[0])
	const end = Number(split[1])
	return `${start} and ${end}`
}

const getProcessedLabel = (value: string): string => {
	if (value === 'false') {
		return 'Live'
	} else {
		return 'Completed'
	}
}

const getStateLabel = (value: string): string => {
	if (value === 'RESOLVED') {
		return 'Resolved'
	} else if (value === 'IGNORED') {
		return 'Ignored'
	} else {
		return 'Open'
	}
}

const getMultiselectOption = (props: any) => {
	const {
		label,
		value,
		isSelected,
		selectOption,
		data: { __isNew__: isNew },
		selectProps: { inputValue },
	} = props

	return (
		<div>
			<components.Option {...props}>
				<div className={styles.optionLabelContainer}>
					<Checkbox
						className={styles.optionCheckbox}
						checked={isSelected}
						onChange={() => {
							selectOption({
								label: label,
								value: value,
								data: { fromCheckbox: true },
							})
						}}
					></Checkbox>

					<OptionLabelName>
						{isNew ? ( // Don't highlight user provided values (e.g. contains/matches input)
							label
						) : (
							<ScrolledTextHighlighter
								searchWords={inputValue.split(' ')}
								textToHighlight={label}
							/>
						)}
					</OptionLabelName>
				</div>
			</components.Option>
		</div>
	)
}

const getOption = (props: any) => {
	const {
		label,
		value,
		selectProps: { inputValue },
	} = props
	const type = getType(value)
	const nameLabel = getNameLabel(label)
	const typeLabel = getTypeLabel(value)
	const tooltipMessage = TOOLTIP_MESSAGES[value]
	const searchWords = [inputValue]

	return (
		<div>
			<components.Option {...props}>
				<div className={styles.optionLabelContainer}>
					{!!typeLabel && (
						<div className={styles.labelTypeContainer}>
							<div className={styles.optionLabelType}>
								<TextHighlighter
									searchWords={searchWords}
									textToHighlight={typeLabel}
								/>
							</div>
						</div>
					)}
					<div className={styles.optionLabelName}>
						<TextHighlighter
							searchWords={searchWords}
							textToHighlight={nameLabel}
						/>
					</div>
					{(!!tooltipMessage ||
						type === SESSION_TYPE ||
						type === CUSTOM_TYPE ||
						type === ERROR_TYPE ||
						type === ERROR_FIELD_TYPE ||
						value === 'user_identifier') && (
						<InfoTooltip
							title={tooltipMessage ?? TOOLTIP_MESSAGE}
							size="medium"
							hideArrow
							placement="right"
							className={styles.optionTooltip}
						/>
					)}
				</div>
			</components.Option>
		</div>
	)
}

const PopoutContent = ({
	value,
	onChange,
	loadOptions,
	setVisible,
	type,
	...props
}: PopoutContentProps & SetVisible & OptionTypeBase) => {
	switch (type) {
		case 'select':
			return (
				<AsyncSelect
					autoFocus
					openMenuOnFocus
					value={value?.kind === 'single' ? value : null}
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
									className={styles.menuListContainer}
									maxHeight={400}
									{...props}
								></components.MenuList>
							)
						},
						Option: getOption,
					}}
					noOptionsMessage={({ inputValue }) =>
						`No results for "${inputValue}"`
					}
					onChange={(item) => {
						onChange(
							!!item ? { kind: 'single', ...item } : undefined,
						)
						setVisible(false)
					}}
					{...props}
				/>
			)
		case 'multiselect':
			const selected =
				(value?.kind === 'multi' ? value.options : null) ?? []
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
						return loadOptions(input, callback).then((results) => [
							...selected,
							...results.filter(
								(r: any) => !selectedSet.has(r.value),
							),
						])
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
									className={styles.menuListContainer}
									maxHeight={400}
									{...props}
								></components.MenuList>
							)
						},
						Option: getMultiselectOption,
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
										kind: 'multi',
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
		case 'creatable':
			const created =
				(value?.kind === 'multi' ? value.options : null) ?? []
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
									className={styles.menuListContainer}
									maxHeight={400}
									{...props}
								></components.MenuList>
							)
						},
						Option: getMultiselectOption,
					}}
					noOptionsMessage={() => null}
					onChange={(item) => {
						onChange(
							!!item
								? {
										kind: 'multi',
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
		case 'date_range':
			return (
				<DateInput
					startDate={
						value?.kind === 'multi'
							? new Date(
									getAbsoluteStartTime(
										value.options[0]?.value,
									)!,
							  )
							: undefined
					}
					endDate={
						value?.kind === 'multi'
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
							kind: 'multi',
							options: [
								{
									label: getDateLabel(value),
									value: value,
								},
							],
						})
						setVisible(false)
					}}
				/>
			)
		case 'time_range':
			return (
				<LengthInput
					type={type}
					start={
						value?.kind === 'multi'
							? Number(value.options[0]?.value.split('_')[0])
							: 0
					}
					end={
						value?.kind === 'multi'
							? Number(value.options[0]?.value.split('_')[1])
							: TIME_MAX_LENGTH
					}
					max={TIME_MAX_LENGTH}
					onChange={(start, end) => {
						const value = `${start}_${end}`

						onChange({
							kind: 'multi',
							options: [
								{
									label: getTimeLabel(value),
									value,
								},
							],
						})
						setVisible(false)
					}}
				/>
			)
		case 'range':
			return (
				<LengthInput
					type={type}
					start={
						value?.kind === 'multi'
							? Number(value.options[0]?.value.split('_')[0])
							: 0
					}
					end={
						value?.kind === 'multi'
							? Number(value.options[0]?.value.split('_')[1])
							: RANGE_MAX_LENGTH
					}
					max={RANGE_MAX_LENGTH}
					onChange={(start, end) => {
						const value = `${start}_${end}`

						onChange({
							kind: 'multi',
							options: [
								{
									label: getLengthLabel(value),
									value,
								},
							],
						})
						setVisible(false)
					}}
				/>
			)
	}
}

const SelectPopout = ({
	value,
	disabled,
	cssClass,
	limitWidth,
	...props
}: PopoutProps &
	PopoutContentProps & {
		cssClass?: ClassValue | ClassValue[]
		limitWidth?: boolean
	}) => {
	// Visible by default if no value yet
	const [visible, setVisible] = useState(!value)
	const onSetVisible = (val: boolean) => {
		setVisible(val)
	}

	const invalid =
		value === undefined ||
		(value?.kind === 'multi' && value.options.length === 0)

	const tooltipMessage =
		(value?.kind === 'multi' &&
			value.options.map((o) => o.label).join(', ')) ||
		undefined

	const inner = (
		<Tooltip
			title={tooltipMessage}
			mouseEnterDelay={1.5}
			overlayStyle={{ maxWidth: '50vw', fontSize: '12px' }}
		>
			<span className={newStyle.tagPopoverAnchor}>
				<Tag
					kind="secondary"
					size="medium"
					shape="basic"
					className={clsx(cssClass, {
						[styles.invalid]: invalid && !visible,
					})}
					lines={limitWidth ? '1' : undefined}
					disabled={disabled}
				>
					{invalid && '--'}
					{value?.kind === 'single' && getNameLabel(value.label)}
					{value?.kind === 'multi' &&
						value.options.length > 1 &&
						`${value.options.length} selections`}
					{value?.kind === 'multi' &&
						value.options.length === 1 &&
						value.options[0].label}
				</Tag>
			</span>
		</Tooltip>
	)

	if (disabled) {
		return inner
	}

	return (
		<Popover
			showArrow={false}
			trigger="click"
			content={
				<PopoutContent
					value={value}
					setVisible={onSetVisible}
					{...props}
				/>
			}
			placement="bottomLeft"
			contentContainerClassName={styles.contentContainer}
			popoverClassName={styles.popoverContainer}
			onVisibleChange={(isVisible) => {
				setVisible(isVisible)
			}}
			visible={visible}
			destroyTooltipOnHide
		>
			{inner}
		</Popover>
	)
}

const getPopoutType = (op: Operator | undefined): PopoutType => {
	switch (op) {
		case 'contains':
		case 'not_contains':
		case 'matches':
		case 'not_matches':
			return 'creatable'
		case 'between_date':
			return 'date_range'
		case 'between_time':
			return 'time_range'
		case 'between':
			return 'range'
		default:
			return 'multiselect'
	}
}

const QueryRule = ({
	rule,
	onChangeKey,
	getKeyOptions,
	onChangeOperator,
	getOperatorOptions,
	onChangeValue,
	getValueOptions,
	onRemove,
	readonly,
}: { rule: RuleProps } & RuleSettings) => {
	return (
		<Box display="inline-flex" gap="1">
			<SelectPopout
				value={rule.field}
				onChange={onChangeKey}
				loadOptions={getKeyOptions}
				type="select"
				disabled={readonly}
				cssClass={[newStyle.flatRight, newStyle.tagKey]}
			/>
			<SelectPopout
				value={getOperator(rule.op, rule.val)}
				onChange={onChangeOperator}
				loadOptions={getOperatorOptions}
				type="select"
				disabled={readonly}
				cssClass={[
					newStyle.tagKey,
					newStyle.flatLeft,
					{
						[newStyle.flatRight]:
							(!!rule.op && hasArguments(rule.op)) || !readonly,
					},
				]}
			/>
			{!!rule.op && hasArguments(rule.op) && (
				<SelectPopout
					value={rule.val}
					onChange={onChangeValue}
					loadOptions={getValueOptions}
					type={getPopoutType(rule.op)}
					disabled={readonly}
					limitWidth
					cssClass={[
						newStyle.tagValue,
						newStyle.flatLeft,
						{ [newStyle.flatRight]: !readonly },
					]}
				/>
			)}
			{!readonly && (
				<Tag
					size="medium"
					kind="secondary"
					shape="basic"
					className={newStyle.flatLeft}
					onClick={() => {
						onRemove()
					}}
					iconRight={<IconSolidX size={12} />}
				/>
			)}
		</Box>
	)
}

export const hasArguments = (op: Operator): boolean =>
	!['exists', 'not_exists'].includes(op)

const LABEL_MAP_SINGLE: { [K in Operator]: string } = {
	is: 'is',
	is_not: 'is not',
	contains: 'contains',
	not_contains: 'does not contain',
	exists: 'exists',
	not_exists: 'does not exist',
	between: 'is between',
	not_between: 'is not between',
	between_time: 'is between',
	not_between_time: 'is not between',
	between_date: 'is between',
	not_between_date: 'is not between',
	matches: 'matches',
	not_matches: 'does not match',
}

const LABEL_MAP_MULTI: { [K in Operator]: string } = {
	is: 'is any of',
	is_not: 'is not any of',
	contains: 'contains any of',
	not_contains: 'does not contain any of',
	exists: 'exists',
	not_exists: 'does not exist',
	between: 'is between',
	not_between: 'is not between',
	between_time: 'is between',
	not_between_time: 'is not between',
	between_date: 'is between',
	not_between_date: 'is not between',
	matches: 'matches any of',
	not_matches: 'does not match any of',
}

const TOOLTIP_MESSAGES: { [K in string]: string } = {
	contains: 'Filters for results that contain the input term(s).',
	not_contains: 'Filters for results that do not contain the input term(s).',
	matches:
		'Filters for results which match the input regex(es). Uses Lucene regex syntax.',
	not_matches:
		'Filters for results which do not match the input regex(es). Uses Lucene regex syntax.',
	exists: 'Filters for results which have this field.',
	not_exists: 'Filters for results which do not have this field.',
}

export type Operator =
	| 'is'
	| 'is_not'
	| 'contains'
	| 'not_contains'
	| 'exists'
	| 'not_exists'
	| 'between'
	| 'not_between'
	| 'between_time'
	| 'not_between_time'
	| 'between_date'
	| 'not_between_date'
	| 'matches'
	| 'not_matches'

export const OPERATORS: Operator[] = [
	'is',
	'is_not',
	'contains',
	'not_contains',
	'exists',
	'not_exists',
	'matches',
	'not_matches',
]

export const CUSTOM_TYPE = 'custom'
export const SESSION_TYPE = 'session'
export const ERROR_TYPE = 'error'
export const ERROR_FIELD_TYPE = 'error-field'

export const RANGE_OPERATORS: Operator[] = ['between', 'not_between']

export const TIME_OPERATORS: Operator[] = ['between_time', 'not_between_time']

export const BOOLEAN_OPERATORS: Operator[] = ['is']

const LABEL_MAP: { [key: string]: string } = {
	referrer: 'Referrer',
	os_name: 'Operating System',
	active_length: 'Length',
	app_version: 'App Version',
	browser_name: 'Browser',
	browser: 'Browser',
	'visited-url': 'Visited URL',
	visited_url: 'Visited URL',
	city: 'City',
	country: 'Country',
	created_at: 'Date',
	device_id: 'Device ID',
	os_version: 'OS Version',
	browser_version: 'Browser Version',
	environment: 'Environment',
	processed: 'Status',
	viewed: 'Viewed By Anyone',
	viewed_by_me: 'Viewed By Me',
	first_time: 'First Time',
	starred: 'Starred',
	identifier: 'Identifier',
	reload: 'Reloaded',
	state: 'Status',
	event: 'Event',
	timestamp: 'Date',
	has_rage_clicks: 'Has Rage Clicks',
	has_errors: 'Has Errors',
	pages_visited: 'Pages Visited',
	landing_page: 'Landing Page',
	exit_page: 'Exit Page',
	has_comments: 'Has Comments',
}

const getOperator = (
	op: Operator | undefined,
	val: OnChangeInput,
): SelectOption | undefined => {
	if (!op) {
		return undefined
	}

	const label = (isSingle(val) ? LABEL_MAP_SINGLE : LABEL_MAP_MULTI)[op]
	return {
		kind: 'single',
		value: op,
		label,
	}
}

const isSingle = (val: OnChangeInput) =>
	!(val?.kind === 'multi' && val.options.length > 1)

interface FieldOptions {
	operators?: Operator[]
	type?: string
}

interface HasOptions {
	options?: FieldOptions
}
export type CustomField = HasOptions & Pick<Field, 'type' | 'name'>

export type QueryBuilderRule = string[]

export interface QueryBuilderState {
	isAnd: boolean
	rules: QueryBuilderRule[]
}

export const serializeRules = (rules: RuleProps[]): QueryBuilderRule[] => {
	return rules
		.map((rule) => {
			const ret: QueryBuilderRule = []

			if (!isComplete(rule)) {
				return ret
			}

			if (rule.field?.value) {
				ret.push(rule.field.value)
			}

			if (rule.op) {
				ret.push(rule.op)
			}

			if (rule?.val?.options) {
				ret.push(
					...rule.val.options.map((op) => {
						return op.value
					}),
				)
			}

			return ret
		})
		.filter((ruleGroup) => !!ruleGroup && ruleGroup.length > 0)
}

const LABEL_FUNC_MAP: { [K in string]: (x: string) => string } = {
	custom_processed: getProcessedLabel,
	custom_created_at: getDateLabel,
	custom_active_length: getLengthLabel,
	custom_pages_visited: getLengthLabel,
	error_state: getStateLabel,
	'error-field_timestamp': getDateLabel,
}

export const deserializeGroup = (
	fieldVal: string,
	opVal: string,
	vals: string[],
): RuleProps => {
	const labelFunc = LABEL_FUNC_MAP[fieldVal]
	return {
		field: {
			kind: 'single',
			label: getName(fieldVal),
			value: fieldVal,
		},
		op: opVal as Operator,
		val: {
			kind: 'multi',
			options: vals.map((val) => {
				return {
					label: labelFunc ? labelFunc(val) : val,
					value: val,
				}
			}),
		},
	}
}

export const deserializeRules = (ruleGroups: Array<string[]>): RuleProps[] => {
	ruleGroups = ruleGroups.filter((g) => g.length)
	if (!ruleGroups) {
		return []
	}
	return ruleGroups.map((group: any[]) => {
		const [field, op, ...vals] = group
		return deserializeGroup(field, op, vals)
	})
}

const isComplete = (rule: RuleProps) =>
	rule.field !== undefined &&
	rule.op !== undefined &&
	(!hasArguments(rule.op) ||
		(rule.val !== undefined && rule.val.options.length !== 0))

const getNameLabel = (label: string) => LABEL_MAP[label] ?? label

const getTypeLabel = (value: string) => {
	const type = getType(value)
	const mapped = type === CUSTOM_TYPE ? 'session' : type
	if (!!mapped && ['track', 'user', 'session'].includes(mapped)) {
		return mapped
	}
	return undefined
}

export const getType = (value: string) => {
	return value.split('_')[0]
}

const getName = (value: string) => {
	const [, ...rest] = value.split('_')
	return rest.join('_')
}

export const propertiesToRules = (
	properties: any[],
	type: string,
	op: string,
): RuleProps[] => {
	const propsMap = new Map<string, any[]>()
	for (const prop of properties) {
		if (!propsMap.has(prop.name)) {
			propsMap.set(prop.name, [])
		}
		propsMap.get(prop.name)?.push(prop.value.split(':')[0])
	}
	const rules: RuleProps[] = []
	for (const [name, vals] of propsMap) {
		const key = `${type}_${name}`
		if (key === 'user_contains') {
			if (op === 'is_not') {
				rules.push(
					deserializeGroup(`user_identifier`, 'not_contains', vals),
				)
			} else {
				rules.push(
					deserializeGroup(`user_identifier`, 'contains', vals),
				)
			}
		} else {
			rules.push(deserializeGroup(`${type}_${name}`, op, vals))
		}
	}
	return rules
}

export type FetchFieldVariables =
	| Partial<
			Exact<{
				project_id: string
				count: number
				field_type: string
				field_name: string
				query: string
				start_date: string
				end_date: string
				use_clickhouse: boolean
			}>
	  >
	| undefined

interface QueryBuilderProps {
	searchContext: BaseSearchContext
	timeRangeField: SelectOption
	customFields: CustomField[]
	fetchFields: (variables?: FetchFieldVariables) => Promise<string[]>
	fieldData?: GetFieldTypesQuery
	readonly?: boolean
	setShowLeftPanel: (value: boolean) => void
	useEditAnySegmentMutation:
		| typeof useEditSegmentMutation
		| typeof useEditErrorSegmentMutation
	useGetAnySegmentsQuery:
		| typeof useGetSegmentsQuery
		| typeof useGetErrorSegmentsQuery
	CreateAnySegmentModal:
		| typeof CreateSegmentModal
		| typeof CreateErrorSegmentModal
	DeleteAnySegmentModal:
		| typeof DeleteSessionSegmentModal
		| typeof DeleteErrorSegmentModal
}

enum QueryBuilderMode {
	EMPTY = 'EMPTY',
	CUSTOM = 'CUSTOM',
	SEGMENT = 'SEGMENT',
	SEGMENT_UPDATE = 'SEGMENT_UPDATE',
}

enum SegmentModalState {
	HIDDEN = 'HIDDEN',
	CREATE = 'CREATE',
	EDIT_NAME = 'EDIT_NAME',
}

const defaultMinDate = getNow().subtract(90, 'days').toDate()
const defaultPreset = defaultPresets[5]

function QueryBuilder(props: QueryBuilderProps) {
	const {
		searchContext,
		timeRangeField,
		customFields,
		fetchFields,
		fieldData,
		readonly,
		setShowLeftPanel,
		useEditAnySegmentMutation,
		useGetAnySegmentsQuery,
		CreateAnySegmentModal,
		DeleteAnySegmentModal,
	} = props

	const {
		backendSearchQuery,
		searchQuery,
		setSearchQuery,
		existingQuery,
		searchResultsCount,
		selectedSegment,
		setSelectedSegment,
		removeSelectedSegment,
	} = searchContext

	const { project_id: projectId } = useParams<{
		project_id: string
	}>()

	const location = useLocation()
	const isOnErrorsPage = location.pathname.includes('errors')

	const { isHighlightAdmin } = useAuthContext()

	const [useClickhouse] = useLocalStorage(
		'highlight-session-search-use-clickhouse-v2',
		isHighlightAdmin || Number(projectId) % 2 == 0,
	)

	const { loading: segmentsLoading, data: segmentData } =
		useGetAnySegmentsQuery({
			variables: { project_id: projectId! },
			skip: !projectId,
			onCompleted: (data) => {
				if (selectedSegment && selectedSegment.id) {
					const match = data?.segments
						?.map((s) => s)
						.find((s) => s?.id === selectedSegment.id)

					if (match && match.params?.query) {
						setSelectedSegment(
							{ id: match.id, name: match.name },
							match.params?.query,
						)
						return
					} else {
						setSelectedSegment(undefined, searchQuery)
					}
				}
			},
		})

	const [segmentModalState, setSegmentModalState] = useState(
		SegmentModalState.HIDDEN,
	)

	const [segmentToDelete, setSegmentToDelete] = useState<{
		name?: string
		id?: string
	} | null>(null)

	const [editSegment] = useEditAnySegmentMutation({
		refetchQueries: [namedOperations.Query.GetSegments],
	})

	const segmentOptions = (segmentData?.segments || [])
		.map((segment) => ({
			name: segment?.name || '',
			id: segment?.id || '',
		}))
		.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1))

	const currentSegment = segmentData?.segments
		?.map((s) => s)
		.find((s) => s?.id === selectedSegment?.id)

	const selectSegment = useCallback(
		(segment?: Pick<Segment | ErrorSegment, 'id' | 'name'>) => {
			if (segment && segment.id && segment.name) {
				const match = segmentData?.segments
					?.map((s) => s)
					.find((s) => s?.id === segment?.id)

				if (match && match.params?.query) {
					setSelectedSegment(
						{ id: segment.id, name: segment.name },
						match.params?.query,
					)
					return
				}
			}

			removeSelectedSegment()
		},
		[removeSelectedSegment, segmentData?.segments, setSelectedSegment],
	)

	const getCustomFieldOptions = useCallback(
		(field: SelectOption | undefined) => {
			if (!field) {
				return undefined
			}

			const type = getType(field.value)
			if (
				![
					CUSTOM_TYPE,
					SESSION_TYPE,
					ERROR_TYPE,
					ERROR_FIELD_TYPE,
				].includes(type)
			) {
				return undefined
			}

			return customFields.find((f) => f.name === field.label)?.options
		},
		[customFields],
	)

	const getDefaultOperator = (field: SelectOption | undefined) =>
		((field && getCustomFieldOptions(field)?.operators) ?? OPERATORS)[0]

	const { data: appVersionData } = useGetAppVersionsQuery({
		variables: { project_id: projectId! },
		skip: !projectId,
	})

	const [currentRule, setCurrentRule] = useState<RuleProps | undefined>()

	const {
		isAnd: serializedIsAnd,
		rules: serializedRules,
	}: { isAnd: boolean; rules: any } = JSON.parse(searchQuery)
	const startingRules = deserializeRules(serializedRules)
	const [isAnd, toggleIsAnd] = useToggle(serializedIsAnd)
	const [rules, setRules] = useState<RuleProps[]>(startingRules)

	const startingDateRange = startingRules.find(
		(rule) =>
			rule.op === 'between_date' &&
			rule.field?.value === timeRangeField.value,
	)?.val?.options?.[0]?.value
	let from, to: Date | undefined
	if (startingDateRange) {
		const [fromStr, toStr] = startingDateRange.split('_')
		from = new Date(fromStr)
		to = new Date(toStr)
	}
	const [dateRange, setDateRange] = useState<Date[]>([
		from ?? defaultPreset.startDate, // Start at 30days
		to ?? new Date(getNow().toISOString()),
	])

	const filterRules = useMemo(
		() =>
			rules.filter((rule) => rule.field?.value !== timeRangeField.value),
		[rules, timeRangeField.value],
	)

	const setRulesImpl = useCallback(
		(newRules: RuleProps[]) => {
			setRules(newRules)

			if (readonly || !newRules.every(isComplete)) {
				return
			}

			const newState = JSON.stringify({
				isAnd,
				rules: serializeRules(newRules),
			})
			setSearchQuery(newState)
		},
		[isAnd, readonly, setSearchQuery],
	)

	const addNewRule = () => {
		setCurrentRule({
			field: undefined,
			op: undefined,
			val: undefined,
		})
		setCurrentStep(1)
	}
	const addRule = useCallback(
		(rule: RuleProps) => {
			setRulesImpl([...rules, rule])
			setCurrentRule(undefined)
		},
		[rules, setRulesImpl],
	)
	const removeRule = useCallback(
		(targetRule: RuleProps) =>
			setRulesImpl(rules.filter((rule) => rule !== targetRule)),
		[rules, setRulesImpl],
	)
	const updateRule = useCallback(
		(targetRule: RuleProps, newProps: any) => {
			setRulesImpl(
				rules.map((rule) =>
					rule !== targetRule ? rule : { ...rule, ...newProps },
				),
			)
		},
		[rules, setRulesImpl],
	)

	const timeRangeRule = useMemo<RuleProps>(() => {
		const timeRange = rules.find(
			(rule) => rule.field?.value === timeRangeField.value,
		)! // ZANETODO: can we enforce this?

		return timeRange
	}, [rules, timeRangeField.value])

	const getKeyOptions = useCallback(
		async (input: string) => {
			return customFields
				.concat(fieldData?.field_types ?? [])
				.map((ft) => ({
					label: ft.name,
					value: ft.type + '_' + ft.name,
				}))
				.filter((ft) =>
					(
						getTypeLabel(ft.value)?.toLowerCase() +
						':' +
						getNameLabel(ft.label).toLowerCase()
					).includes(input.toLowerCase()),
				)
				.sort((a, b) => {
					const aLower = getNameLabel(a.label).toLowerCase()
					const bLower = getNameLabel(b.label).toLowerCase()
					if (aLower < bLower) {
						return -1
					} else if (aLower === bLower) {
						return 0
					} else {
						return 1
					}
				})
		},
		[customFields, fieldData?.field_types],
	)

	const getOperatorOptionsCallback = (
		options: FieldOptions | undefined,
		val: OnChangeInput,
	) => {
		return async (input: string) => {
			return (options?.operators ?? OPERATORS)
				.map((op) => getOperator(op, val))
				.filter((op) =>
					op?.label.toLowerCase().includes(input.toLowerCase()),
				)
		}
	}

	const getValueOptionsCallback = useCallback(
		(field: SelectOption | undefined) => {
			return async (input: string) => {
				if (field === undefined) {
					return
				}

				let options: { label: string; value: string }[] = []
				if (field.value === 'custom_app_version') {
					options =
						appVersionData?.app_version_suggestion
							.filter((val) => !!val)
							.map((val) => ({
								label: val as string,
								value: val as string,
							})) ?? []
				} else if (field.value === 'custom_processed') {
					options = ['true', 'false'].map((v) => ({
						label: getProcessedLabel(v),
						value: v,
					}))
				} else if (field.value === 'error_state') {
					options = ['OPEN', 'RESOLVED', 'IGNORED'].map((v) => ({
						label: getStateLabel(v),
						value: v,
					}))
				} else if (field.value === 'error_Type') {
					options = [
						'Backend',
						'console.error',
						'window.onerror',
						'custom',
					].map((v) => ({
						label: v,
						value: v,
					}))
				} else if (getCustomFieldOptions(field)?.type === 'boolean') {
					options = ['true', 'false'].map((v) => ({
						label: v,
						value: v,
					}))
				}

				if (options.length > 0) {
					return options.filter((opt) =>
						opt.label?.toLowerCase().includes(input.toLowerCase()),
					)
				}

				let label = field.label
				if (field.value === 'error_Event') {
					label = 'event'
				}

				return await fetchFields({
					project_id: projectId,
					count: 10,
					field_type: getType(field.value),
					field_name: label,
					query: input,
					start_date: moment(dateRange[0]).toISOString(),
					end_date: moment(dateRange[1]).toISOString(),
					use_clickhouse: useClickhouse,
				}).then((res) => {
					return res.map((val) => ({
						label: val,
						value: val,
					}))
				})
			}
		},
		[
			appVersionData?.app_version_suggestion,
			fetchFields,
			getCustomFieldOptions,
			projectId,
			dateRange,
			useClickhouse,
		],
	)

	const areRulesValid = rules.every(isComplete)

	// If the search query is updated externally,
	// set the rules and `isAnd` toggle based on it
	useEffect(() => {
		if (searchQuery) {
			const newState = JSON.parse(searchQuery)
			const deserializedRules = deserializeRules(newState.rules)

			const dateRange = deserializedRules?.find(
				(rule) =>
					rule.op === 'between_date' &&
					rule.field?.value === timeRangeField.value,
			)?.val?.options?.[0]?.value
			if (dateRange) {
				const [from, to] = dateRange.split('_')
				setDateRange([new Date(from), new Date(to)])
			}

			toggleIsAnd(newState.isAnd)
			setRules(deserializedRules)
		}
	}, [searchQuery, timeRangeField.value, toggleIsAnd])

	// When the query builder is unmounted, reset the state.
	// Not sure if this is desired behavior in the long term, but
	// this matches the current prod behavior.
	useEffect(() => {
		return () => {
			removeSelectedSegment()
		}
	}, [removeSelectedSegment])

	const [currentStep, setCurrentStep] = useState<number | undefined>(
		undefined,
	)

	const mode = useMemo(() => {
		if (filterRules.length === 0 && !selectedSegment) {
			return QueryBuilderMode.EMPTY
		} else if (selectedSegment !== undefined) {
			if (searchQuery !== existingQuery) {
				return QueryBuilderMode.SEGMENT_UPDATE
			} else {
				return QueryBuilderMode.SEGMENT
			}
		}
		return QueryBuilderMode.CUSTOM
	}, [existingQuery, filterRules.length, searchQuery, selectedSegment])

	const addFilterButton = useMemo(() => {
		if (readonly) {
			return null
		}

		return (
			<Popover
				showArrow={false}
				trigger="click"
				content={
					currentRule?.field === undefined ? (
						<PopoutContent
							key="popover-step-1"
							value={undefined}
							setVisible={() => {
								setCurrentStep(undefined)
							}}
							onChange={(val) => {
								const field = val as SelectOption | undefined
								const operators =
									field &&
									getCustomFieldOptions(field)?.operators
								addRule({
									field: field,
									op:
										operators && operators.length === 1
											? operators[0]
											: undefined,
									val: undefined,
								})
							}}
							loadOptions={getKeyOptions}
							type="select"
							placeholder="Filter..."
						/>
					) : currentRule?.op === undefined ? (
						<PopoutContent
							key="popover-step-2"
							value={undefined}
							setVisible={() => {
								setCurrentStep(3)
							}}
							onChange={(val) => {
								const op = (val as SelectOption)
									.value as Operator
								if (!hasArguments(op)) {
									setCurrentStep(undefined)
									addRule({
										...currentRule,
										op,
									})
								} else {
									setCurrentRule({
										...currentRule,
										op,
									})
								}
							}}
							loadOptions={getOperatorOptionsCallback(
								getCustomFieldOptions(currentRule.field),
								currentRule.val,
							)}
							type="select"
							placeholder="Select..."
						/>
					) : (
						<PopoutContent
							key="popover-step-3"
							value={undefined}
							setVisible={() => {
								setCurrentStep(undefined)
							}}
							onChange={(val) => {
								addRule({
									...currentRule,
									val: val as MultiselectOption | undefined,
								})
							}}
							loadOptions={getValueOptionsCallback(
								currentRule.field,
							)}
							type={getPopoutType(currentRule.op)}
							placeholder="Select..."
						/>
					)
				}
				placement="bottomLeft"
				contentContainerClassName={styles.contentContainer}
				popoverClassName={styles.popoverContainer}
				destroyTooltipOnHide
				onVisibleChange={(isVisible) => {
					if (!isVisible) {
						setCurrentStep(undefined)
					}
				}}
				visible={
					currentStep === 1 ||
					(currentStep === 2 && !!currentRule?.field) ||
					(currentStep === 3 && !!currentRule?.op)
				}
			>
				{mode === QueryBuilderMode.EMPTY ? (
					<Button
						kind="secondary"
						size="xSmall"
						emphasis="low"
						iconLeft={<IconSolidPlusSm size={12} />}
						onClick={addNewRule}
						trackingId="queryBuilderAddFilter"
					>
						Add filter
					</Button>
				) : (
					<ButtonIcon
						kind="secondary"
						size="xSmall"
						emphasis="low"
						icon={<IconSolidPlusSm size={12} />}
						onClick={addNewRule}
						cssClass={newStyle.addButton}
					/>
				)}
			</Popover>
		)
	}, [
		addRule,
		currentRule,
		currentStep,
		getCustomFieldOptions,
		getKeyOptions,
		getValueOptionsCallback,
		mode,
		readonly,
	])

	const canUpdateSegment =
		!!selectedSegment && filterRules.length > 0 && areRulesValid

	const updateSegment = useCallback(() => {
		if (canUpdateSegment) {
			editSegment({
				variables: {
					project_id: projectId!,
					id: selectedSegment.id,
					params: {
						query: searchQuery,
					},
					name: selectedSegment.name,
				},
			})
				.then(() => {
					message.success(`Updated '${selectedSegment.name}'`, 5)
					setSelectedSegment(
						{
							id: selectedSegment.id,
							name: selectedSegment.name,
						},
						searchQuery,
					)
				})
				.catch(() => {
					message.error('Error updating segment!', 5)
				})
		}
	}, [
		canUpdateSegment,
		editSegment,
		projectId,
		searchQuery,
		selectedSegment?.id,
		selectedSegment?.name,
		setSelectedSegment,
	])

	const actionButton = useMemo(() => {
		switch (mode) {
			case QueryBuilderMode.EMPTY:
				return addFilterButton
			case QueryBuilderMode.CUSTOM:
				return (
					<Menu.Button
						kind="secondary"
						size="xSmall"
						emphasis="medium"
						iconLeft={<IconSolidSave size={12} />}
						onClick={(e: React.MouseEvent) => {
							e.preventDefault()
							setSegmentModalState(SegmentModalState.CREATE)
						}}
						disabled={!areRulesValid}
					>
						Save
					</Menu.Button>
				)
			case QueryBuilderMode.SEGMENT:
				return (
					<Menu.Button
						kind="secondary"
						size="xSmall"
						emphasis="medium"
						iconLeft={<IconSolidSegment size={12} />}
						iconRight={<IconSolidCheveronDown size={12} />}
						onClick={() => {}}
					>
						<Text lines="1">{selectedSegment?.name}</Text>
					</Menu.Button>
				)
			case QueryBuilderMode.SEGMENT_UPDATE:
				return (
					<Menu.Button
						kind="primary"
						size="xSmall"
						emphasis="high"
						iconLeft={<IconSolidSegment size={12} />}
						iconRight={<IconSolidCheveronDown size={12} />}
					>
						<Text lines="1">{selectedSegment?.name}</Text>
					</Menu.Button>
				)
		}
	}, [addFilterButton, areRulesValid, mode, selectedSegment?.name])

	const controlBar = useMemo(() => {
		return (
			<Box
				display="flex"
				alignItems="center"
				px="12"
				borderBottom="secondary"
				cssClass={styles.controlBar}
			>
				<PreviousDateRangePicker
					presets={defaultPresets}
					selectedDates={dateRange}
					minDate={defaultMinDate}
					onDatesChange={(dates: Date[]) => {
						setDateRange(dates)
						if (!dates[0] || !dates[1]) {
							return
						}
						updateRule(timeRangeRule, {
							val: {
								kind: 'multi',
								options: [
									{
										label: 'Date Range',
										value: `${dates[0].toISOString()}_${dates[1].toISOString()}`,
									},
								],
							} as MultiselectOption,
						})
					}}
				/>
				<Box marginLeft="auto" display="flex" gap="4">
					{!isOnErrorsPage && (
						<DropdownMenu
							sessionCount={searchResultsCount || 0}
							sessionQuery={backendSearchQuery?.searchQuery || ''}
						/>
					)}

					<ButtonIcon
						kind="secondary"
						size="small"
						shape="square"
						emphasis="low"
						icon={<IconSolidLogout size={14} />}
						onClick={() => setShowLeftPanel(false)}
					/>
				</Box>
			</Box>
		)
	}, [
		dateRange,
		searchResultsCount,
		backendSearchQuery?.searchQuery,
		updateRule,
		timeRangeRule,
		setShowLeftPanel,
		isOnErrorsPage,
	])

	const alteredSegmentSettings = useMemo(() => {
		return (
			<>
				<Menu.Item
					onClick={(e) => {
						e.stopPropagation()
						updateSegment()
					}}
					disabled={!canUpdateSegment}
				>
					<Box
						display="flex"
						alignItems="center"
						gap="4"
						userSelect="none"
					>
						<IconSolidCloudUpload size={16} color={colors.n9} />
						Update segment
					</Box>
				</Menu.Item>
				<Menu.Item
					onClick={(e) => {
						e.stopPropagation()
						setSegmentModalState(SegmentModalState.CREATE)
					}}
					disabled={!canUpdateSegment}
				>
					<Box
						display="flex"
						alignItems="center"
						gap="4"
						userSelect="none"
					>
						<IconSolidPlusCircle size={16} color={colors.n9} />
						Save as a new segment
					</Box>
				</Menu.Item>
				<Menu.Item
					onClick={(e) => {
						e.stopPropagation()
						if (currentSegment) {
							selectSegment(currentSegment)
						}
					}}
				>
					<Box
						display="flex"
						alignItems="center"
						gap="4"
						userSelect="none"
					>
						<IconSolidRefresh size={16} color={colors.n9} />
						Reset to segment filters
					</Box>
				</Menu.Item>

				<Menu.Divider />
			</>
		)
	}, [canUpdateSegment, currentSegment, selectSegment, updateSegment])

	// Don't render anything if this is a readonly query builder and there are no rules
	if (readonly && rules.length === 0) {
		return null
	}

	return (
		<>
			<CreateAnySegmentModal
				showModal={segmentModalState !== SegmentModalState.HIDDEN}
				onHideModal={() => {
					setSegmentModalState(SegmentModalState.HIDDEN)
				}}
				afterCreateHandler={(segmentId, segmentName) => {
					if (segmentData?.segments) {
						setSelectedSegment(
							{
								id: segmentId,
								name: segmentName,
							},
							searchQuery,
						)
					}
				}}
				currentSegment={
					segmentModalState === SegmentModalState.EDIT_NAME
						? currentSegment
						: undefined
				}
			/>
			<DeleteAnySegmentModal
				showModal={!!segmentToDelete}
				hideModalHandler={() => {
					setSegmentToDelete(null)
				}}
				segmentToDelete={segmentToDelete}
				afterDeleteHandler={() => {
					if (
						segmentToDelete &&
						selectedSegment?.name === segmentToDelete.name
					) {
						removeSelectedSegment()
					}
				}}
			/>
			{!readonly && controlBar}
			<Box
				border="secondary"
				borderRadius="8"
				display="flex"
				flexDirection="column"
				overflow="hidden"
				flexShrink={0}
				m={readonly ? undefined : '8'}
				shadow="medium"
			>
				{mode !== QueryBuilderMode.EMPTY && (
					<Box
						p="4"
						paddingBottom="8"
						background="white"
						borderBottom={readonly ? undefined : 'secondary'}
						display="flex"
						alignItems="center"
						flexWrap="wrap"
						gap="4"
					>
						{filterRules.flatMap((rule, index) => [
							...(index != 0
								? [
										<Tag
											shape="basic"
											kind="secondary"
											emphasis="low"
											onClick={toggleIsAnd}
											key={`separator-${index}`}
											disabled={readonly}
										>
											{isAnd ? 'and' : 'or'}
										</Tag>,
								  ]
								: []),
							<QueryRule
								key={`rule-${index}`}
								rule={rule}
								onChangeKey={(val) => {
									// Default to 'is' when rule is not defined yet
									if (rule.op === undefined) {
										updateRule(rule, {
											field: val,
											op: getDefaultOperator(rule.field),
										})
									} else {
										updateRule(rule, { field: val })
									}
								}}
								getKeyOptions={getKeyOptions}
								onChangeOperator={(val) => {
									if (val?.kind === 'single') {
										updateRule(rule, { op: val.value })
									}
								}}
								getOperatorOptions={getOperatorOptionsCallback(
									getCustomFieldOptions(rule.field),
									rule.val,
								)}
								onChangeValue={(val) => {
									updateRule(rule, { val: val })
								}}
								getValueOptions={getValueOptionsCallback(
									rule.field,
								)}
								onRemove={() => removeRule(rule)}
								readonly={readonly ?? false}
							/>,
						])}
						{addFilterButton}
					</Box>
				)}
				{!readonly && (
					<Box
						display="flex"
						p="8"
						paddingRight="4"
						justifyContent="space-between"
						alignItems="center"
					>
						{searchResultsCount === undefined ? (
							<Skeleton width="100px" />
						) : (
							<Text
								size="xSmall"
								weight="medium"
								color="n9"
								userSelect="none"
							>
								{formatNumber(searchResultsCount)} results
							</Text>
						)}
						<Box
							display="flex"
							gap="4"
							alignItems="center"
							cssClass={newStyle.maxHalfWidth}
						>
							<Menu placement="bottom-end">
								{actionButton}
								<Menu.List cssClass={styles.menuList}>
									<Box
										background="n2"
										borderBottom="secondary"
										p="8"
										mb="4"
									>
										<Text
											weight="medium"
											size="xxSmall"
											color="n11"
											userSelect="none"
										>
											Segment settings
										</Text>
									</Box>
									{mode === QueryBuilderMode.SEGMENT_UPDATE
										? alteredSegmentSettings
										: null}

									<Menu.Item
										onClick={(e) => {
											e.stopPropagation()
											setSegmentModalState(
												SegmentModalState.EDIT_NAME,
											)
										}}
									>
										<Box
											display="flex"
											alignItems="center"
											gap="4"
											userSelect="none"
										>
											<IconSolidPencil
												size={16}
												color={colors.n9}
											/>
											Edit segment name
										</Box>
									</Menu.Item>

									<Menu.Item
										onClick={(e) => {
											e.stopPropagation()
											if (currentSegment) {
												selectSegment(currentSegment)
												setSegmentModalState(
													SegmentModalState.CREATE,
												)
											}
										}}
									>
										<Box
											display="flex"
											alignItems="center"
											gap="4"
											userSelect="none"
										>
											<IconSolidDocumentDuplicate
												size={16}
												color={colors.n9}
											/>
											Duplicate segment
										</Box>
									</Menu.Item>

									<Menu.Divider />
									<Menu.Item
										onClick={(e) => {
											e.stopPropagation()
											setSegmentToDelete({
												id: currentSegment?.id,
												name: currentSegment?.name,
											})
										}}
									>
										<Box
											display="flex"
											alignItems="center"
											gap="4"
											userSelect="none"
										>
											<IconSolidTrash
												size={16}
												color={colors.n9}
											/>
											Delete segment
										</Box>
									</Menu.Item>
								</Menu.List>
							</Menu>

							<Menu>
								<Menu.Button
									kind="secondary"
									disabled={segmentsLoading}
									emphasis="high"
									icon={<IconSolidSegment size={12} />}
									size="xSmall"
									cssClass={newStyle.noShrink}
								/>
								<Menu.List cssClass={styles.menuList}>
									<Box
										background="n2"
										borderBottom="secondary"
										p="8"
										mb="4"
									>
										<Text
											weight="medium"
											size="xxSmall"
											color="n11"
											userSelect="none"
										>
											Segments
										</Text>
									</Box>
									{segmentOptions.map((segment, idx) => (
										<Menu.Item
											key={idx}
											onClick={(e) => {
												e.stopPropagation()
												selectSegment(segment)
											}}
										>
											<Text lines="1">
												{segment.name}
											</Text>
										</Menu.Item>
									))}
									{segmentOptions.length > 0 && (
										<Menu.Divider />
									)}
									<Menu.Item
										onClick={(e) => {
											e.stopPropagation()
											selectSegment()
										}}
									>
										Reset to defaults
									</Menu.Item>
								</Menu.List>
							</Menu>
						</Box>
					</Box>
				)}
			</Box>
		</>
	)
}

export default QueryBuilder
