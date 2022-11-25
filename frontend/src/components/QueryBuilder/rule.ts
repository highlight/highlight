import {
	CustomField,
	CustomFieldType,
	FieldOptions,
	MultiselectOption,
	OptionKind,
	SelectOption,
} from '@components/QueryBuilder/field'
import { Operator, OperatorName } from '@components/QueryBuilder/operator'
import { GetHistogramBucketSize } from '@components/SearchResultsHistogram/SearchResultsHistogram'
import { BackendSearchQuery } from '@context/BaseSearchContext'
import { Admin } from '@graph/schemas'
import { getAbsoluteEndTime, getAbsoluteStartTime } from '@util/time'
import moment from 'moment'

type OpenSearchQuery = {
	query: any
	childQuery?: any
}

const TIME_MAX_LENGTH = 60
const RANGE_MAX_LENGTH = 200

export class Rule {
	field?: SelectOption
	op?: Operator
	val?: SelectOption | MultiselectOption

	constructor(
		field?: SelectOption,
		op?: Operator,
		val?: SelectOption | MultiselectOption,
	) {
		this.op = op
		this.field = field
		this.val = val
	}

	get isComplete(): boolean {
		return (
			this.field !== undefined &&
			this.op !== undefined &&
			(this.op.name === OperatorName.EXISTS ||
				(this.val !== undefined &&
					(this.val.kind === OptionKind.MULTI
						? this.val.options.length !== 0
						: !!this.val.value)))
		)
	}

	get type(): string | undefined {
		return this.field?.value.split('_')[0]
	}

	get isErrorSpecific(): boolean {
		return (
			this.type === CustomFieldType.ERROR_FIELD ||
			this.type === CustomFieldType.ERROR
		)
	}

	update(params: any) {
		if (Object.hasOwn(params, 'field')) {
			this.field = params.field
		}
		if (Object.hasOwn(params, 'op')) {
			this.op = params.op
		}
		if (Object.hasOwn(params, 'val')) {
			this.val = params.val
		}
	}

	getCustomOptions(customFields?: CustomField[]): FieldOptions | undefined {
		if (
			this.field &&
			this.type &&
			Object.values(CustomFieldType).includes(
				this.type as CustomFieldType,
			)
		) {
			return customFields?.find((f) => f.name === this.field?.label)
				?.options
		}
	}
}

interface RuleMetadata {
	admin?: Admin
	customFields?: CustomField[]
	value?: string
}

function _parseRuleBody(rule: Rule, metadata?: RuleMetadata) {
	if (!rule?.field) {
		return {}
	}
	switch (rule.type) {
		case CustomFieldType.CUSTOM:
		case CustomFieldType.ERROR:
		case CustomFieldType.ERROR_FIELD:
			const name = rule.field.label
			const value = metadata?.value
			const isKeyword = !(
				rule.getCustomOptions(metadata?.customFields)?.type !== 'text'
			)

			if (rule.field.label === 'viewed_by_me' && metadata?.admin) {
				const baseQuery = {
					term: {
						[`viewed_by_admins.id`]: metadata.admin.id,
					},
				}

				if (value === 'true') {
					return {
						...baseQuery,
					}
				}
				return {
					bool: {
						must_not: {
							...baseQuery,
						},
					},
				}
			}

			switch (rule.op?.name) {
				case OperatorName.IS:
					return {
						term: {
							[`${name}${isKeyword ? '.keyword' : ''}`]: value,
						},
					}
				case OperatorName.CONTAINS:
					return {
						wildcard: {
							[`${name}${
								isKeyword ? '.keyword' : ''
							}`]: `*${value}*`,
						},
					}
				case OperatorName.MATCHES:
					return {
						regexp: {
							[`${name}${isKeyword ? '.keyword' : ''}`]: value,
						},
					}
				case OperatorName.EXISTS:
					return { exists: { field: name } }
				case OperatorName.BETWEEN_DATE:
					return {
						range: {
							[name]: {
								gte: getAbsoluteStartTime(value),
								lte: getAbsoluteEndTime(value),
							},
						},
					}
				case OperatorName.BETWEEN_TIME:
					return {
						range: {
							[name]: {
								gte: Number(value?.split('_')[0]) * 60 * 1000,
								...(Number(value?.split('_')[1]) ===
								TIME_MAX_LENGTH
									? null
									: {
											lte:
												Number(value?.split('_')[1]) *
												60 *
												1000,
									  }),
							},
						},
					}
				case OperatorName.BETWEEN:
					return {
						range: {
							[name]: {
								gte: Number(value?.split('_')[0]),
								...(Number(value?.split('_')[1]) ===
								RANGE_MAX_LENGTH
									? null
									: {
											lte: Number(value?.split('_')[1]),
									  }),
							},
						},
					}
				default:
					return {}
			}
		default:
			const key = rule.field.value
			switch (rule.op?.name) {
				case OperatorName.IS:
					return {
						term: { 'fields.KeyValue': `${key}_${value}` },
					}
				case OperatorName.CONTAINS:
					return {
						wildcard: {
							'fields.KeyValue': `${key}_*${value}*`,
						},
					}
				case OperatorName.MATCHES:
					return {
						regexp: {
							'fields.KeyValue': `${key}_${value}`,
						},
					}
				case OperatorName.EXISTS:
					return { term: { 'fields.Key': key } }
				default:
					return {}
			}
	}
}

export function parseRule(rule: Rule, metadata?: RuleMetadata): any {
	if (rule.op?.negated) {
		const negatedRule = new Rule(
			rule.field,
			{ negated: false, ...rule?.op },
			rule?.val,
		)
		return {
			bool: {
				must_not: {
					...parseRule(negatedRule, metadata),
				},
			},
		}
	} else if (
		rule.op?.name !== OperatorName.EXISTS &&
		rule.val?.kind === OptionKind.MULTI
	) {
		return {
			bool: {
				should: rule.val?.options.map(({ value }) => {
					return _parseRuleBody(rule, { ...metadata, value })
				}),
			},
		}
	} else {
		return _parseRuleBody(rule, metadata)
	}

	return {}
}

export function parseFilter(
	rules: Rule[],
	timeRangeRule: Rule,
	isAnd: boolean,
	metadata?: RuleMetadata,
): OpenSearchQuery {
	const condition = isAnd ? 'must' : 'should'
	const filterErrors =
		rules.some((r) => r.isErrorSpecific) || timeRangeRule.isErrorSpecific

	const timeRangeRuleParsed = parseRule(timeRangeRule, metadata)

	const errorObjectRules = rules
		.filter((rule) => rule.isErrorSpecific && rule !== timeRangeRule)
		.map((rule) => parseRule(rule, metadata))

	const standardRules = rules
		.filter((rule) => !rule.isErrorSpecific && rule !== timeRangeRule)
		.map((rule) => parseRule(rule, metadata))

	const request: OpenSearchQuery = { query: {} }

	if (filterErrors) {
		const errorGroupFilter = {
			bool: {
				[condition]: standardRules,
			},
		}
		const errorObjectFilter = {
			bool: {
				must: [timeRangeRuleParsed],
			},
		}

		if (errorObjectRules.length) {
			errorObjectFilter.bool.must.push({
				bool: {
					[condition]: errorObjectRules,
				},
			})
		}

		request.query = {
			bool: {
				must: [
					{
						has_child: {
							type: 'child',
							query: errorObjectFilter,
						},
					},
				],
			},
		}

		request.childQuery = {
			bool: {
				must: [errorObjectFilter],
			},
		}

		if (standardRules.length) {
			request.query.bool.must.push(errorGroupFilter)
			request.childQuery.bool.must.push({
				has_parent: {
					parent_type: 'parent',
					query: errorGroupFilter,
				},
			})
		}
	} else {
		request.query = {
			bool: {
				must: [timeRangeRuleParsed],
			},
		}
		if (standardRules.length) {
			request.query.bool.must.push({
				bool: {
					[condition]: standardRules,
				},
			})
		}
	}
	return request
}

export function parseQuery(
	rules: Rule[],
	isAnd: boolean,
	defaultTimeRangeRule: Rule,
	metadata?: RuleMetadata,
): BackendSearchQuery {
	let timeRangeRule = rules.find(
		(rule) => rule.field?.value === defaultTimeRangeRule.field!.value,
	)
	if (!timeRangeRule) {
		timeRangeRule = defaultTimeRangeRule
	}

	const timeRange = (timeRangeRule?.val as MultiselectOption).options[0].value

	const startDate = moment(getAbsoluteStartTime(timeRange))
	const endDate = moment(getAbsoluteEndTime(timeRange))

	const { query, childQuery } = parseFilter(
		rules,
		timeRangeRule,
		isAnd,
		metadata,
	)
	return {
		searchQuery: JSON.stringify(query),
		childSearchQuery: childQuery ? JSON.stringify(childQuery) : undefined,
		startDate,
		endDate,
		histogramBucketSize: GetHistogramBucketSize(
			moment.duration(endDate.diff(startDate)),
		),
	}
}
