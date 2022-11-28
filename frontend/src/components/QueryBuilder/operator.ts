import { OptionKind, SelectOption } from '@components/QueryBuilder/field'

export interface Operator {
	name: OperatorName
	negated?: boolean
}

export enum OperatorName {
	IS = 'IS',
	CONTAINS = 'CONTAINS',
	EXISTS = 'EXISTS',
	BETWEEN = 'BETWEEN',
	BETWEEN_TIME = 'BETWEEN_TIME',
	BETWEEN_DATE = 'BETWEEN_DATE',
	MATCHES = 'MATCHES',
}

export function getOperatorLabel(op: Operator) {
	const parts = []
	switch (op.name) {
		case OperatorName.IS:
			parts.push('is')
			if (op.negated) {
				parts.push('not')
			}
			break
		case OperatorName.CONTAINS:
			if (op.negated) {
				parts.push('does not contain')
			} else {
				parts.push('contains')
			}
			break
		case OperatorName.EXISTS:
			if (op.negated) {
				parts.push('does not exist')
			} else {
				parts.push('exists')
			}
			break
		case OperatorName.BETWEEN:
		case OperatorName.BETWEEN_TIME:
		case OperatorName.BETWEEN_DATE:
			parts.push('is')
			if (op.negated) {
				parts.push('not')
			}
			parts.push('between')
			break
		case OperatorName.MATCHES:
			if (op.negated) {
				parts.push('does not match')
			} else {
				parts.push('matches')
			}
			break
	}
	return parts.join(' ')
}

export function getOperatorAsOption(op?: Operator): SelectOption | undefined {
	if (op) {
		return {
			kind: OptionKind.SINGLE,
			label: getOperatorLabel(op),
			value: JSON.stringify(op),
		}
	}
}
