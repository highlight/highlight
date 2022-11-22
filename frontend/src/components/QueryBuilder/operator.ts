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
