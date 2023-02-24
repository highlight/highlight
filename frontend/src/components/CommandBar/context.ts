import {
	ERROR_FIELD_TYPE,
	ERROR_TYPE,
} from '@pages/ErrorsV2/ErrorQueryBuilder/components/QueryBuilder/QueryBuilder'
import { SESSION_TYPE } from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/components/QueryBuilder/QueryBuilder'
import { createContext } from '@util/context/context'
import { FormState } from 'ariakit/form'

export interface CommandBarSearch {
	search: string
	selectedDates: Date[]
}

export const ATTRIBUTES = [
	{
		type: 'user',
		name: 'identifier',
		displayName: 'Identifier',
	},
	{
		type: SESSION_TYPE,
		name: 'visited_url',
		displayName: 'Visited URL',
	},
	{
		type: SESSION_TYPE,
		name: 'os_name',
		displayName: 'Operating System',
	},
	{
		type: SESSION_TYPE,
		name: 'browser',
		displayName: 'Browser',
	},
	{
		type: ERROR_FIELD_TYPE,
		name: 'browser',
		displayName: 'Browser',
	},
	{
		type: ERROR_FIELD_TYPE,
		name: 'os_name',
		displayName: 'Operating System',
	},
	{
		type: ERROR_FIELD_TYPE,
		name: 'visited_url',
		displayName: 'Visited URL',
	},
	{
		type: ERROR_TYPE,
		name: 'event',
		displayName: 'Error Body',
	},
] as const

export type Attribute = typeof ATTRIBUTES[number]

interface CommandBarContext {
	currentAttribute: Attribute
	setCurrentAttribute: (row: Attribute) => void
	form: FormState<CommandBarSearch>
}

export const [useCommandBarContext, CommandBarContextProvider] =
	createContext<CommandBarContext>('CommandBar')
