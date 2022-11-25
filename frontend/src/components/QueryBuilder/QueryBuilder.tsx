import QueryRule from '@components/QueryBuilder/components/QueryRule/QueryRule'
import {
	CustomField,
	getFieldDisplayName,
	getFieldType,
	getFieldTypeDisplayName,
	OptionKind,
} from '@components/QueryBuilder/field'
import {
	getOperatorAsOption,
	Operator,
	OperatorName,
} from '@components/QueryBuilder/operator'
import { Rule } from '@components/QueryBuilder/rule'
import { BaseSearchContext } from '@context/BaseSearchContext'
import { useGetAppVersionsQuery } from '@graph/hooks'
import { GetFieldTypesQuery } from '@graph/operations'
import {
	ErrorSearchParamsInput,
	ErrorState,
	Exact,
	SearchParamsInput,
} from '@graph/schemas'
import {
	Box,
	Button,
	ButtonIcon,
	IconChevronDown,
	IconPlusSm,
	IconSave,
	IconSegment,
	Tag,
	Text,
} from '@highlight-run/ui'
import { useParams } from '@util/react-router/useParams'
import { capitalize, omitBy } from 'lodash'
import identity from 'lodash/identity'
import isEqual from 'lodash/isEqual'
import pickBy from 'lodash/pickBy'
import { useCallback, useEffect, useMemo, useState } from 'react'

enum QueryBuilderState {
	EMPTY = 'EMPTY',
	CUSTOM = 'CUSTOM',
	SEGMENT = 'SEGMENT',
	SEGMENT_UPDATE = 'SEGMENT_UPDATE',
}

export type QueryBuilderType = 'sessions' | 'errors'
export type FetchFieldVariables =
	| Partial<
			Exact<{
				project_id: string
				count: number
				field_type: string
				field_name: string
				query: string
			}>
	  >
	| undefined

export interface QueryBuilderProps<SearchParams, SegmentData> {
	searchContext: BaseSearchContext<SearchParams>
	customFields: CustomField[]
	fieldData?: GetFieldTypesQuery
	readonly?: boolean
	fetchFields: (variables?: FetchFieldVariables) => Promise<string[]>
}

type SearchContextTypes = SearchParamsInput | ErrorSearchParamsInput

const DEFAULT_OPERATOR_NAMES = [
	OperatorName.IS,
	OperatorName.CONTAINS,
	OperatorName.EXISTS,
	OperatorName.MATCHES,
] as const

function QueryBuilder<SearchParams extends SearchContextTypes, SegmentData>({
	searchContext,
	readonly,
	customFields,
	fieldData,
	fetchFields,
}: QueryBuilderProps<SearchParams, SegmentData>) {
	const [builderState, setBuilderState] = useState<QueryBuilderState>(
		QueryBuilderState.EMPTY,
	)

	const {
		rules,
		setRules,
		searchParams,
		existingParams,
		segmentName,
		isAnd,
		toggleIsAnd,
	} = searchContext
	const [areParamsDifferent, setAreParamsDifferent] = useState(false)

	const { project_id: projectId } = useParams<{
		project_id: string
	}>()

	useEffect(() => {
		// Compares original params and current search params to check if they are different
		// Removes undefined, null fields, and empty arrays when comparing
		const normalize = (params: SearchContextTypes) =>
			omitBy(
				pickBy(params, identity),
				(val) => Array.isArray(val) && val.length === 0,
			)
		setAreParamsDifferent(
			!isEqual(normalize(searchParams), normalize(existingParams)),
		)
	}, [searchParams, existingParams])

	useEffect(() => {
		if (!!segmentName) {
			if (areParamsDifferent) {
				setBuilderState(QueryBuilderState.SEGMENT_UPDATE)
			} else {
				setBuilderState(QueryBuilderState.SEGMENT)
			}
		}
	}, [areParamsDifferent, segmentName])

	const actionButton = useMemo(() => {
		switch (builderState) {
			case QueryBuilderState.EMPTY:
				return (
					<Button
						kind="secondary"
						size="xSmall"
						emphasis="low"
						iconLeft={<IconPlusSm size={12} />}
						onClick={() => {
							setBuilderState(QueryBuilderState.CUSTOM)
						}}
					>
						Add filter
					</Button>
				)
			case QueryBuilderState.CUSTOM:
				return (
					<Button
						kind="secondary"
						size="xSmall"
						emphasis="medium"
						iconLeft={<IconSave size={12} />}
						onClick={() => {
							setBuilderState(QueryBuilderState.EMPTY)
						}}
					>
						Save
					</Button>
				)
			case QueryBuilderState.SEGMENT:
				return (
					<Button
						kind="secondary"
						size="xSmall"
						emphasis="medium"
						iconLeft={<IconSegment size={12} />}
						iconRight={<IconChevronDown size={12} />}
						onClick={() => {}}
					>
						{segmentName}
					</Button>
				)
			case QueryBuilderState.SEGMENT_UPDATE:
				return (
					<Button
						kind="primary"
						size="xSmall"
						emphasis="high"
						iconLeft={<IconSegment size={12} />}
						iconRight={<IconChevronDown size={12} />}
						onClick={() => {}}
					>
						{segmentName}
					</Button>
				)
		}
	}, [builderState, segmentName])

	const [currentStep, setCurrentStep] = useState<number | undefined>(
		undefined,
	)

	const [currentRule, setCurrentRule] = useState<Rule | undefined>()

	const createNewRule = () => {
		setCurrentRule(new Rule())
		setCurrentStep(1)
	}
	const addRule = useCallback(
		(rule: Rule) => {
			setRules((rules) => [...rules, rule])
			setCurrentRule(undefined)
		},
		[setRules],
	)
	const removeRule = useCallback(
		(targetRule: Rule) =>
			setRules((rules) => rules.filter((rule) => rule !== targetRule)),
		[setRules],
	)
	const updateRule = useCallback(
		(targetRule: Rule, newProps: any) => {
			setRules((rules) =>
				rules.map((rule) => {
					if (rule === targetRule) {
						rule.update(newProps)
					}
					return rule
				}),
			)
		},
		[setRules],
	)

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
						getFieldTypeDisplayName(
							getFieldType(ft),
						)?.toLowerCase() +
						':' +
						getFieldDisplayName(ft).toLowerCase()
					).includes(input.toLowerCase()),
				)
				.sort((a, b) => {
					const aLower = getFieldDisplayName(a).toLowerCase()
					const bLower = getFieldDisplayName(b).toLowerCase()
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

	const getOperatorOptionsCallback = useCallback(
		(rule: Rule) => {
			const options = rule.getCustomOptions(customFields)
			const defaultOperators: Operator[] = DEFAULT_OPERATOR_NAMES.flatMap(
				(name) => [
					{
						name,
					},
					{ name, negated: true },
				],
			)

			return async (input: string) => {
				return (options?.operators ?? defaultOperators)
					.map(getOperatorAsOption)
					.filter((op) =>
						op?.label.toLowerCase().includes(input.toLowerCase()),
					)
			}
		},
		[customFields],
	)

	const { data: appVersionData } = useGetAppVersionsQuery({
		variables: { project_id: projectId },
	})

	const getValueOptionsCallback = useCallback(
		(rule: Rule) => {
			const customOptions = rule.getCustomOptions(customFields)
			const field = rule.field
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
					options = [true, false].map((v) => ({
						label: v ? 'Completed' : 'Live',
						value: v.toString(),
					}))
				} else if (field.value === 'error_state') {
					options = Object.values(ErrorState).map((v) => ({
						label: capitalize(v.toLowerCase()),
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
				} else if (customOptions?.type === 'boolean') {
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
					field_type: rule.type,
					field_name: label,
					query: input,
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
			customFields,
			fetchFields,
			projectId,
		],
	)

	const filterSection = useMemo(() => {
		if (builderState === QueryBuilderState.EMPTY) {
			return null
		}

		return (
			<Box
				p="4"
				paddingBottom="8"
				background="white"
				borderBottom="neutral"
			>
				{rules.map((rule, idx) => (
					<>
						{idx !== 0 && (
							<Tag onClick={() => toggleIsAnd()}>
								{isAnd ? 'and' : 'or'}
							</Tag>
						)}
						<QueryRule
							key={idx}
							rule={rule}
							readonly={readonly}
							onChangeKey={(val) => {
								// Default to 'is' when rule is not defined yet
								if (rule.op === undefined) {
									updateRule(rule, {
										field: val,
										op: rule
											.getCustomOptions(customFields)
											?.operators?.at(0) ?? {
											name: OperatorName.IS,
										},
									})
								} else {
									updateRule(rule, { field: val })
								}
							}}
							getKeyOptions={getKeyOptions}
							onChangeOperator={(val) => {
								if (val?.kind === OptionKind.SINGLE) {
									updateRule(rule, {
										op: JSON.parse(val.value),
									})
								}
							}}
							getOperatorOptions={getOperatorOptionsCallback(
								rule,
							)}
							onChangeValue={(val) => {
								updateRule(rule, { val })
							}}
							getValueOptions={getValueOptionsCallback(rule)}
							onRemove={() => removeRule(rule)}
						/>
					</>
				))}
			</Box>
		)
	}, [
		builderState,
		customFields,
		getKeyOptions,
		getOperatorOptionsCallback,
		getValueOptionsCallback,
		isAnd,
		readonly,
		removeRule,
		rules,
		toggleIsAnd,
		updateRule,
	])

	return (
		<Box
			border="neutral"
			borderRadius="8"
			display="flex"
			flexDirection="column"
			overflow="hidden"
		>
			{filterSection}
			<Box
				display="flex"
				p="8"
				paddingRight="4"
				justifyContent="space-between"
				alignItems="center"
			>
				<Text
					size="xSmall"
					weight="medium"
					color="neutral300"
					userSelect="none"
				>
					300 results
				</Text>
				<Box display="flex" gap="4">
					{actionButton}
					<ButtonIcon
						kind="secondary"
						size="tiny"
						emphasis="high"
						shape="square"
						icon={<IconSegment size={12} />}
					/>
				</Box>
			</Box>
		</Box>
	)
}

export default QueryBuilder
