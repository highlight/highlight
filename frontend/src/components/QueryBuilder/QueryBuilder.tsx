import { Skeleton } from '@components/Skeleton/Skeleton'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { BaseSearchContext } from '@context/BaseSearchContext'
import {
	useEditErrorSegmentMutation,
	useEditSegmentMutation,
	useGetAppVersionsQuery,
	useGetErrorSegmentsQuery,
	useGetSegmentsQuery,
} from '@graph/hooks'
import {
	GetErrorTagsQuery,
	GetFieldTypesClickhouseQuery,
	namedOperations,
} from '@graph/operations'
import { ErrorSegment, Exact, Field, Segment } from '@graph/schemas'
import { colors } from '@highlight-run/ui/colors'
import {
	Box,
	ButtonIcon,
	ComboboxSelect,
	DateRangePicker,
	DEFAULT_TIME_PRESETS,
	getNow,
	IconSolidCalendar,
	IconSolidChat,
	IconSolidCheveronDown,
	IconSolidClock,
	IconSolidCloudUpload,
	IconSolidCube,
	IconSolidCubeTransparent,
	IconSolidCursorClick,
	IconSolidDesktopComputer,
	IconSolidDocumentAdd,
	IconSolidDocumentDuplicate,
	IconSolidDocumentRemove,
	IconSolidDocumentText,
	IconSolidEye,
	IconSolidGlobe,
	IconSolidGlobeAlt,
	IconSolidLightningBolt,
	IconSolidLink,
	IconSolidLogout,
	IconSolidPencil,
	IconSolidPlayCircle,
	IconSolidPlusCircle,
	IconSolidPlusSm,
	IconSolidQuestionMarkCircle,
	IconSolidRefresh,
	IconSolidSave,
	IconSolidSegment,
	IconSolidSparkles,
	IconSolidTag,
	IconSolidTerminal,
	IconSolidTrash,
	IconSolidUser,
	IconSolidUserAdd,
	IconSolidX,
	Menu,
	Popover,
	Tag,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { DateInput } from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/components/DateInput/DateInput'
import { LengthInput } from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/components/LengthInput/LengthInput'
import { formatNumber } from '@util/numbers'
import { useParams } from '@util/react-router/useParams'
import { roundFeedDate, serializeAbsoluteTimeRange } from '@util/time'
import { message } from 'antd'
import clsx, { ClassValue } from 'clsx'
import moment, { unitOfTime } from 'moment'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useToggle } from 'react-use'

import LoadingBox from '@/components/LoadingBox'
import { searchesAreEqual } from '@/components/QueryBuilder/utils'
import { CreateErrorSegmentModal } from '@/pages/Errors/ErrorSegmentModals/CreateErrorSegmentModal'
import { DeleteErrorSegmentModal } from '@/pages/Errors/ErrorSegmentModals/DeleteErrorSegmentModal'
import usePlayerConfiguration from '@/pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { CreateSegmentModal } from '@/pages/Sessions/SearchSidebar/SegmentModals/CreateSegmentModal'
import { DeleteSessionSegmentModal } from '@/pages/Sessions/SearchSidebar/SegmentModals/DeleteSessionSegmentModal'

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
	options: readonly Option[]
}

type Option = { label: string; value: string }
type OnSelectChange = (val: SelectOption) => void
type OnMultiselectChange = (val: MultiselectOption) => void
type LoadOptions = (input: string) => Promise<Option[] | undefined>
type UpdateRule = (targetRule: RuleProps, newProps: any) => void
type RemoveRule = (targetRule: RuleProps) => void

interface RuleSettings {
	getKeyOptions: LoadOptions
	getOperatorOptionsCallback: (
		options: FieldOptions | undefined,
		val: MultiselectOption | undefined,
	) => LoadOptions
	getValueOptionsCallback: (field: SelectOption | undefined) => LoadOptions
	getCustomFieldOptions: (
		field: SelectOption | undefined,
	) => FieldOptions | undefined
	getDefaultOperator: (field: SelectOption | undefined) => Operator
	updateRule: UpdateRule
	removeRule: RemoveRule
	readonly: boolean
	minimal: boolean
}

type PopoutType =
	| 'select'
	| 'multiselect'
	| 'creatable'
	| 'editable'
	| 'date_range'
	| 'time_range'
	| 'range'

interface MultiselectPopoutContentProps {
	type: PopoutType
	value: MultiselectOption | undefined
	onChange: OnMultiselectChange
	loadOptions: LoadOptions
}

interface SelectPopoutContentProps {
	type: PopoutType
	value: SelectOption | undefined
	icon?: React.ReactNode
	valueRender?: React.ReactNode
	onChange: OnSelectChange
	loadOptions: LoadOptions
	defaultOpen?: boolean
}

interface PopoutProps {
	disabled: boolean
}

export const TIME_MAX_LENGTH = 60
export const RANGE_MAX_LENGTH = 200

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

const getOption = (option: Option, query: string) => {
	const { label, value } = option
	const nameLabel = getNameLabel(label)
	const icon = getIcon(value)
	const tooltipMessage = TOOLTIP_MESSAGES[value]

	return (
		<div className={newStyle.optionLabelContainer}>
			{icon}
			<TextHighlighter
				searchWords={[query]}
				textToHighlight={nameLabel}
			/>
			{!!tooltipMessage && (
				<Tooltip
					placement="right"
					trigger={
						<Box display="flex">
							<IconSolidQuestionMarkCircle size={18} />
						</Box>
					}
				>
					<Text color="moderate" size="xSmall">
						{tooltipMessage}
					</Text>
				</Tooltip>
			)}
		</div>
	)
}

const PopoutContent = ({
	value,
	onChange,
	type,
}: MultiselectPopoutContentProps) => {
	switch (type) {
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
					}}
				/>
			)
	}
	return null
}

function useDebouncedState<T>(
	initialState: T,
	delay: number,
): [T, React.Dispatch<React.SetStateAction<T>>] {
	const [value, setValue] = useState<T>(initialState)
	const [debouncedValue, setDebouncedValue] = useState<T>(value)

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay)

		return () => {
			clearTimeout(timer)
		}
	}, [value, delay])

	return [debouncedValue, setValue]
}

const MultiselectPopout = ({
	value,
	cssClass,
	loadOptions,
	type,
	onChange,
	disabled,
}: PopoutProps &
	MultiselectPopoutContentProps & {
		cssClass?: ClassValue | ClassValue[]
		limitWidth?: boolean
	}) => {
	const [query, setQuery] = useDebouncedState('', 300)
	const [lastQuery, setLastQuery] = useState('')
	const [options, setOptions] = useState<Option[] | undefined>(undefined)
	useMemo(() => {
		loadOptions(query).then((v) => {
			setOptions(v ?? [])
			setLastQuery(query)
		})
	}, [loadOptions, query])

	const invalid = value === undefined || value.options.length === 0

	let label = '--'
	if (invalid) {
		label = '--'
	} else if (value.options.length > 1) {
		label = `${value.options.length} selections`
	} else if (value.options.length === 1) {
		label = value.options[0].label
	}

	const loadingBox = (
		<div className={newStyle.loadingBox}>
			<LoadingBox />
		</div>
	)

	let multiValue: string[] = []
	switch (type) {
		case 'multiselect':
			multiValue = value?.options.map((o) => o.value) ?? []
			return (
				<ComboboxSelect
					label="value"
					value={multiValue}
					valueRender={label}
					options={options?.map((o) => ({
						key: o.value,
						render: getOption(o, lastQuery),
					}))}
					onChange={(val: string[]) => {
						onChange({
							kind: 'multi',
							options: val.map((i) => ({
								label: i,
								value: i,
							})),
						})
					}}
					onChangeQuery={(val: string) => {
						setQuery(val)
					}}
					cssClass={cssClass}
					queryPlaceholder="Filter..."
					defaultOpen={invalid}
					disabled={disabled}
					loadingRender={loadingBox}
				/>
			)
		case 'creatable':
			multiValue = value?.options.map((o) => o.value) ?? []
			return (
				<ComboboxSelect
					label="value"
					value={multiValue}
					valueRender={label}
					options={[]}
					onChange={(val: string[]) => {
						onChange({
							kind: 'multi',
							options: val.map((i) => ({
								label: i,
								value: i,
							})),
						})
					}}
					onChangeQuery={(val: string) => {
						setQuery(val)
					}}
					cssClass={cssClass}
					queryPlaceholder="Filter..."
					creatableRender={(query) =>
						getOption({ label: query, value: query }, '')
					}
					defaultOpen={invalid}
					disabled={disabled}
					loadingRender={loadingBox}
				/>
			)
		case 'editable':
			multiValue = value?.options.map((o) => o.value) ?? []
			return (
				<ComboboxSelect
					label="value"
					value={multiValue}
					valueRender={label}
					options={options?.map((o) => ({
						key: o.value,
						render: getOption(o, lastQuery),
					}))}
					onChange={(val: string[]) => {
						onChange({
							kind: 'multi',
							options: val.map((i) => ({
								label: i,
								value: i,
							})),
						})
					}}
					onChangeQuery={(val: string) => {
						setQuery(val)
					}}
					cssClass={cssClass}
					queryPlaceholder="Filter..."
					creatableRender={(query) =>
						getOption({ label: query, value: query }, '')
					}
					defaultOpen={invalid}
					disabled={disabled}
					loadingRender={loadingBox}
				/>
			)
		case 'date_range':
		case 'time_range':
		case 'range':
			return (
				<Popover placement="bottom-start">
					<span className={newStyle.tagPopoverAnchor}>
						<Popover.TagTrigger
							kind="secondary"
							shape="basic"
							size="medium"
							lines="1"
							className={clsx([
								newStyle.flatLeft,
								newStyle.flatRight,
							])}
						>
							{label}
						</Popover.TagTrigger>
					</span>
					<Popover.Content
						disabled={disabled}
						className={newStyle.selectPopover}
					>
						<PopoutContent
							value={value}
							type={type}
							onChange={onChange}
							loadOptions={loadOptions}
						/>
					</Popover.Content>
				</Popover>
			)
	}
	return null
}

const SelectPopout = ({
	value,
	valueRender,
	icon,
	cssClass,
	loadOptions,
	onChange,
	defaultOpen,
	disabled,
}: PopoutProps &
	SelectPopoutContentProps & {
		cssClass?: ClassValue | ClassValue[]
		limitWidth?: boolean
	}) => {
	const [query, setQuery] = useState('')
	const [options, setOptions] = useState<Option[]>([])
	useMemo(() => {
		loadOptions(query).then((v) => setOptions(v ?? []))
	}, [loadOptions, query])

	let label = '--'
	if (value !== undefined) {
		label = getNameLabel(value.label)
	}

	return (
		<ComboboxSelect
			label="key"
			icon={icon}
			value={value?.value ?? ''}
			valueRender={valueRender !== undefined ? valueRender : label}
			options={options.map((o) => ({
				key: o.value,
				render: getOption(o, query),
			}))}
			onChange={(val: string) => {
				const selected = options.find((o) => o.value === val)!
				onChange({
					kind: 'single',
					...selected,
				})
			}}
			onChangeQuery={(val: string) => {
				setQuery(val)
			}}
			cssClass={cssClass}
			queryPlaceholder="Filter..."
			defaultOpen={defaultOpen}
			disabled={disabled}
		/>
	)
}

const getPopoutType = (op: Operator | undefined): PopoutType => {
	switch (op) {
		case 'is_editable':
			return 'editable'
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
	getKeyOptions,
	getOperatorOptionsCallback,
	getValueOptionsCallback,
	removeRule,
	updateRule,
	readonly,
	getCustomFieldOptions,
	getDefaultOperator,
}: { rule: RuleProps } & RuleSettings) => {
	const onChangeKey = useCallback(
		(val: SelectOption) => {
			// Default to 'is' when rule is not defined yet
			if (rule.op === undefined) {
				updateRule(rule, {
					field: val,
					op: getDefaultOperator(rule.field),
					val: undefined,
				})
			} else {
				updateRule(rule, {
					field: val,
					val: undefined,
				})
			}
		},
		[getDefaultOperator, rule, updateRule],
	)

	const onChangeOperator = useCallback(
		(val: SelectOption) => {
			if (val?.kind === 'single') {
				updateRule(rule, { op: val.value })
			}
		},
		[rule, updateRule],
	)

	const onChangeValue = useCallback(
		(val: MultiselectOption) => {
			updateRule(rule, { val: val })
		},
		[rule, updateRule],
	)

	const getOperatorOptions = getOperatorOptionsCallback(
		getCustomFieldOptions(rule.field),
		rule.val,
	)

	const getValueOptions = useCallback(
		(input: string) => getValueOptionsCallback(rule.field)(input),
		[getValueOptionsCallback, rule.field],
	)

	return (
		<Box display="inline-flex" gap="1">
			<SelectPopout
				value={rule.field}
				onChange={onChangeKey}
				loadOptions={getKeyOptions}
				type="select"
				disabled={readonly}
				cssClass={[newStyle.tag, newStyle.flatRight, newStyle.tagKey]}
			/>
			<SelectPopout
				value={getOperator(rule.op, rule.val)}
				onChange={onChangeOperator}
				loadOptions={getOperatorOptions}
				type="select"
				disabled={readonly}
				cssClass={[
					newStyle.tag,
					newStyle.tagKey,
					newStyle.flatLeft,
					{
						[newStyle.flatRight]:
							(!!rule.op && hasArguments(rule.op)) || !readonly,
					},
				]}
				defaultOpen={rule.op === undefined}
			/>
			{!!rule.op && hasArguments(rule.op) && (
				<MultiselectPopout
					value={rule.val}
					onChange={onChangeValue}
					loadOptions={getValueOptions}
					type={getPopoutType(rule.op)}
					disabled={readonly}
					limitWidth
					cssClass={[
						newStyle.tag,
						newStyle.flatLeft,
						{ [newStyle.flatRight]: !readonly },
					]}
				/>
			)}
			{!readonly ? (
				<Tag
					size="medium"
					kind="secondary"
					shape="basic"
					className={newStyle.flatLeft}
					onClick={() => {
						removeRule(rule)
					}}
					iconRight={<IconSolidX size={12} />}
				/>
			) : null}
		</Box>
	)
}

export const hasArguments = (op: Operator): boolean =>
	!['exists', 'not_exists'].includes(op)

const LABEL_MAP_SINGLE: { [K in Operator]: string } = {
	is: 'is',
	is_not: 'is not',
	is_editable: 'is',
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
	is_editable: 'is any of',
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
	| 'is_editable'
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
	has_session: 'Has Sessions',
	pages_visited: 'Pages Visited',
	landing_page: 'Landing Page',
	exit_page: 'Exit Page',
	has_comments: 'Has Comments',
	service_name: 'Service',
	service_version: 'Service Version',
	sample: 'Sample',
	trace_id: 'Trace ID',
	secure_session_id: 'Secure Session ID',
}

const getOperator = (
	op: Operator | undefined,
	val: MultiselectOption | undefined,
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

const isSingle = (val: MultiselectOption | undefined) =>
	!(val !== undefined && val.options.length > 1)

interface FieldOptions {
	operators?: Operator[]
	type?: 'text' | 'long' | 'boolean' | 'sample'
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
	custom_active_length: getTimeLabel,
	custom_pages_visited: getLengthLabel,
	error_state: getStateLabel,
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
		(rule.val !== undefined && rule.val?.options?.length !== 0))

const getNameLabel = (label: string) => LABEL_MAP[label] ?? label

const getIcon = (value: string): JSX.Element | undefined => {
	switch (value) {
		case 'custom_app_version':
			return <IconSolidDesktopComputer />
		case 'session_service_name':
			return <IconSolidCubeTransparent />
		case 'session_service_version':
			return <IconSolidCubeTransparent />
		case 'session_browser_name':
			return <IconSolidGlobeAlt />
		case 'session_browser_version':
			return <IconSolidGlobeAlt />
		case 'session_city':
			return <IconSolidGlobe />
		case 'session_clickSelector':
			return <IconSolidCursorClick />
		case 'session_clickTextContent':
			return <IconSolidDocumentText />
		case 'session_country':
			return <IconSolidGlobe />
		case 'session_device_id':
			return <IconSolidUser />
		case 'session_environment':
			return <IconSolidTerminal />
		case 'track_event':
			return <IconSolidCalendar />
		case 'session_exit_page':
			return <IconSolidDocumentRemove />
		case 'custom_first_time':
			return <IconSolidUserAdd />
		case 'custom_has_comments':
			return <IconSolidChat />
		case 'custom_has_errors':
			return <IconSolidLightningBolt />
		case 'custom_has_rage_clicks':
			return <IconSolidCursorClick />
		case 'custom_sample':
			return <IconSolidPencil />
		case 'session_landing_page':
			return <IconSolidDocumentAdd />
		case 'custom_active_length':
			return <IconSolidClock />
		case 'session_os_name':
			return <IconSolidDesktopComputer />
		case 'session_os_version':
			return <IconSolidDesktopComputer />
		case 'session_reload':
			return <IconSolidRefresh />
		case 'custom_processed':
			return <IconSolidTag />
		case 'custom_viewed':
			return <IconSolidEye />
		case 'custom_viewed_by_me':
			return <IconSolidEye />
		case 'session_visited-url':
			return <IconSolidLink />
		case 'error-field_browser':
			return <IconSolidGlobeAlt />
		case 'error-field_environment':
			return <IconSolidTerminal />
		case 'error_Event':
			return <IconSolidCalendar />
		case 'error-field_os_name':
			return <IconSolidDesktopComputer />
		case 'error_state':
			return <IconSolidTag />
		case 'error_Type':
			return <IconSolidCube />
		case 'error_Tag':
			return <IconSolidTag />
		case 'error-field_visited_url':
			return <IconSolidLink />
		case 'error-field_service_name':
			return <IconSolidCubeTransparent />
		case 'error-field_service_version':
			return <IconSolidCubeTransparent />
		case 'error-field_has_session':
			return <IconSolidDesktopComputer />
		case 'error-field_secure_session_id':
			return <IconSolidPlayCircle />
		case 'error-field_trace_id':
			return <IconSolidSparkles />
	}
	const type = getType(value)
	const mapped = type === CUSTOM_TYPE ? 'session' : type
	switch (type) {
		case 'session':
			return <IconSolidDesktopComputer />
		case 'user':
			return <IconSolidUser />
		case 'track':
			return <IconSolidDesktopComputer />
	}
	if (!!mapped && ['track', 'user', 'session'].includes(mapped)) {
		return <IconSolidUser />
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

export interface QueryBuilderProps {
	searchContext: BaseSearchContext
	customFields: CustomField[]
	fetchFields: (variables?: FetchFieldVariables) => Promise<string[]>
	fieldData?: GetFieldTypesClickhouseQuery
	errorTagData?: GetErrorTagsQuery
	operators?: Operator[]
	droppedFieldTypes?: string[]

	readonly?: boolean
	onlyAnd?: boolean
	minimal?: boolean
	setDefault?: boolean
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

function QueryBuilder(props: QueryBuilderProps) {
	const {
		searchContext,
		customFields,
		fetchFields,
		fieldData,
		errorTagData,
		droppedFieldTypes,
		readonly,
		onlyAnd,
		operators,
		minimal,
		setDefault,
		useEditAnySegmentMutation,
		useGetAnySegmentsQuery,
		CreateAnySegmentModal,
		DeleteAnySegmentModal,
	} = props
	const ops = operators ?? OPERATORS

	const {
		searchQuery,
		setSearchQuery,
		existingQuery,
		searchResultsCount,
		selectedSegment,
		setSelectedSegment,
		removeSelectedSegment,
		setSearchTime,
		resetTime,
		startDate,
		endDate,
		selectedPreset,
	} = searchContext

	const { project_id: projectId } = useParams<{
		project_id: string
	}>()

	const location = useLocation()
	const isOnErrorsPage = location.pathname.includes('errors')

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
		((field && getCustomFieldOptions(field)?.operators) ?? ops)[0]

	const { data: appVersionData } = useGetAppVersionsQuery({
		variables: { project_id: projectId! },
		skip: !projectId,
	})

	const [currentRule, setCurrentRule] = useState<RuleProps | undefined>()

	const {
		isAnd: serializedIsAnd,
		rules: serializedRules,
	}: QueryBuilderState = JSON.parse(searchQuery)
	const startingRules = deserializeRules(serializedRules)
	const [isAnd, toggleIsAnd] = useToggle(serializedIsAnd)
	const [rules, setRules] = useState<RuleProps[]>(startingRules)

	const setRulesImpl = useCallback(
		(newRules: RuleProps[], isAnd: boolean, start: Date, end: Date) => {
			setRules(newRules)
			toggleIsAnd(isAnd)

			if (readonly || !newRules.every(isComplete)) {
				return
			}

			const newState = JSON.stringify({
				isAnd,
				rules: serializeRules(newRules),
				dateRange: { start_date: start, end_date: end },
			})
			setSearchQuery(newState)
		},
		[readonly, setSearchQuery, toggleIsAnd],
	)

	const addRule = useCallback(
		(rule: RuleProps) => {
			setRulesImpl([...rules, rule], isAnd, startDate, endDate)
			setCurrentRule(undefined)
		},
		[rules, setRulesImpl, isAnd, startDate, endDate],
	)
	const removeRule = useCallback(
		(targetRule: RuleProps) =>
			setRulesImpl(
				rules.filter((rule) => rule !== targetRule),
				isAnd,
				startDate,
				endDate,
			),
		[rules, setRulesImpl, isAnd, startDate, endDate],
	)
	const updateRule = useCallback(
		(targetRule: RuleProps, newProps: any) => {
			setRulesImpl(
				rules.map((rule) =>
					rule !== targetRule ? rule : { ...rule, ...newProps },
				),
				isAnd,
				startDate,
				endDate,
			)
		},
		[rules, setRulesImpl, isAnd, startDate, endDate],
	)
	const toggleIsAndImpl = useCallback(() => {
		setRulesImpl(rules, !isAnd, startDate, endDate)
	}, [isAnd, rules, setRulesImpl, startDate, endDate])

	const getKeyOptions = useCallback(
		async (input: string) => {
			return customFields
				.concat(fieldData?.field_types ?? [])
				.filter(
					(ft) =>
						!droppedFieldTypes ||
						!droppedFieldTypes.includes(ft.type ?? ''),
				)
				.map((ft) => ({
					label: ft.name,
					value: ft.type + '_' + ft.name,
				}))
				.filter((ft) =>
					getNameLabel(ft.label)
						.toLowerCase()
						.includes(input.toLowerCase()),
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
		[customFields, droppedFieldTypes, fieldData?.field_types],
	)

	const getOperatorOptionsCallback = (
		options: FieldOptions | undefined,
		val: MultiselectOption | undefined,
	) => {
		return async (input: string) => {
			return (options?.operators ?? ops)
				.map((op) => getOperator(op, val))
				.filter((op) => op !== undefined)
				.filter((op) =>
					op?.label.toLowerCase().includes(input.toLowerCase()),
				) as Option[]
		}
	}

	const getValueOptionsCallback = useCallback(
		(field: SelectOption | undefined) => {
			return async (input: string): Promise<Option[] | undefined> => {
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
				} else if (field.value === 'error_Tag') {
					options =
						errorTagData?.error_tags?.map((et) => ({
							label: et?.title ?? '',
							value: et?.title ?? '',
						})) ?? []
				} else if (getCustomFieldOptions(field)?.type === 'boolean') {
					options = ['true', 'false'].map((v) => ({
						label: v,
						value: v,
					}))
				} else if (getCustomFieldOptions(field)?.type === 'sample') {
					options = [
						{
							label: 'New Random Seed',
							value: [...Array(16)]
								.map(() =>
									Math.floor(Math.random() * 16).toString(16),
								)
								.join(''),
						},
					]
				}

				if (options.length > 0) {
					return options
						.filter((opt) =>
							opt.label
								?.toLowerCase()
								.includes(input.toLowerCase()),
						)
						.slice(0, 10)
				}

				let label = field.label
				if (field.value === 'error_Event') {
					label = 'event'
				}

				const fieldType = getType(field.value)

				return await fetchFields({
					project_id: projectId,
					count: 10,
					field_type: fieldType,
					field_name: label,
					query: input,
					start_date: moment(startDate).toISOString(),
					end_date: moment(endDate).toISOString(),
					use_clickhouse: true,
				}).then((res) => {
					return res.map((val) => ({
						label: val,
						value: val,
					}))
				})
			}
		},
		[
			getCustomFieldOptions,
			fetchFields,
			projectId,
			startDate,
			endDate,
			appVersionData?.app_version_suggestion,
			errorTagData?.error_tags,
		],
	)

	const areRulesValid = rules.every(isComplete)

	// If the search query is updated externally,
	// set the rules and `isAnd` toggle based on it
	useEffect(() => {
		if (searchQuery) {
			const newState = JSON.parse(searchQuery)
			const deserializedRules = deserializeRules(newState.rules)

			toggleIsAnd(newState.isAnd)
			setRules(deserializedRules)
		}
	}, [searchQuery, toggleIsAnd])

	// When the query builder is unmounted, reset the state.
	// Not sure if this is desired behavior in the long term, but
	// this matches the current prod behavior.
	useEffect(() => {
		return () => {
			if (!readonly && setDefault !== false) {
				resetTime()
				if (selectedSegment) {
					removeSelectedSegment()
				}
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const { setShowLeftPanel } = usePlayerConfiguration()

	const mode = (() => {
		if (selectedSegment !== undefined) {
			if (searchesAreEqual(searchQuery, existingQuery)) {
				return QueryBuilderMode.SEGMENT
			} else {
				return QueryBuilderMode.SEGMENT_UPDATE
			}
		}
		return QueryBuilderMode.CUSTOM
	})()

	const addFilterButton = useMemo(() => {
		if (readonly) {
			return null
		}

		return (
			<SelectPopout
				value={undefined}
				icon={<IconSolidPlusSm size={12} />}
				onChange={(val) => {
					const field = val as SelectOption | undefined
					const operators =
						field && getCustomFieldOptions(field)?.operators
					addRule({
						field: field,
						op:
							operators && operators.length === 1
								? operators[0]
								: undefined,
						val: undefined,
					})
				}}
				valueRender={null}
				loadOptions={getKeyOptions}
				type="select"
				cssClass={[newStyle.addButton]}
				disabled={false}
			/>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addRule, currentRule, getKeyOptions, readonly])

	const canUpdateSegment =
		!!selectedSegment && rules.length > 0 && areRulesValid

	const updateSegment = useCallback(() => {
		if (canUpdateSegment) {
			editSegment({
				variables: {
					project_id: projectId!,
					id: selectedSegment.id,
					query: searchQuery,
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
	}, [areRulesValid, mode, selectedSegment?.name])

	const controlBar = useMemo(() => {
		return (
			<Box
				display="flex"
				alignItems="center"
				px="12"
				borderBottom="secondary"
				cssClass={styles.controlBar}
			>
				<DateRangePicker
					presets={DEFAULT_TIME_PRESETS}
					selectedValue={{
						startDate,
						endDate,
						selectedPreset,
					}}
					minDate={defaultMinDate}
					onDatesChange={setSearchTime}
				/>
				<Box marginLeft="auto" display="flex" gap="0">
					{!isOnErrorsPage && (
						<DropdownMenu sessionQuery={JSON.parse(searchQuery)} />
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
		endDate,
		setSearchTime,
		isOnErrorsPage,
		searchQuery,
		selectedPreset,
		setShowLeftPanel,
		startDate,
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
						setSelectedSegment(undefined, searchQuery)
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
	}, [
		canUpdateSegment,
		currentSegment,
		searchQuery,
		selectSegment,
		setSelectedSegment,
		updateSegment,
	])

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
			{!readonly && !minimal ? controlBar : null}
			<Box
				border="secondary"
				borderRadius="8"
				display="flex"
				flexDirection="column"
				overflow="hidden"
				flexShrink={0}
				m={readonly || minimal ? undefined : '8'}
				shadow={minimal ? undefined : 'medium'}
				style={minimal ? { minHeight: 28 } : undefined}
			>
				<Box
					p="4"
					background="white"
					borderBottom={readonly || minimal ? undefined : 'secondary'}
					display="flex"
					alignItems="center"
					flexWrap="wrap"
					gap="4"
				>
					{rules.flatMap((rule, index) => [
						...(index != 0
							? [
									<Tag
										shape="basic"
										kind="secondary"
										emphasis="low"
										onClick={toggleIsAndImpl}
										key={`separator-${index}`}
										disabled={onlyAnd ? true : readonly}
									>
										{isAnd ? 'and' : 'or'}
									</Tag>,
							  ]
							: []),
						<QueryRule
							key={`rule-${index}`}
							rule={rule}
							getDefaultOperator={getDefaultOperator}
							getKeyOptions={getKeyOptions}
							getOperatorOptionsCallback={
								getOperatorOptionsCallback
							}
							getCustomFieldOptions={getCustomFieldOptions}
							getValueOptionsCallback={getValueOptionsCallback}
							removeRule={removeRule}
							readonly={readonly ?? false}
							minimal={minimal ?? false}
							updateRule={updateRule}
						/>,
					])}
					{addFilterButton}
				</Box>
				{!readonly && !minimal ? (
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
				) : null}
			</Box>
		</>
	)
}

export default QueryBuilder
