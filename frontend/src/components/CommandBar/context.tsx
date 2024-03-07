import { nextAttribute, useAttributeSearch } from '@components/CommandBar/utils'
import {
	DEFAULT_TIME_PRESETS,
	Form,
	FormState,
	presetStartDate,
	presetValue,
} from '@highlight-run/ui/components'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import { createContext } from '@util/context/context'
import { validateEmail } from '@util/string'
import moment from 'moment'
import React, { useEffect, useMemo, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import {
	ERROR_FIELD_TYPE,
	ERROR_TYPE,
	SESSION_TYPE,
} from '@/components/QueryBuilder/QueryBuilder'

export interface CommandBarSearch {
	search: string
	selectedDates: Date[]
	selectedPreset: string
}

export const ATTRIBUTES = [
	{
		type: 'user',
		name: 'email',
		displayName: 'Email',
	},
	{
		type: 'user',
		name: 'identifier',
		displayName: 'Identifier',
	},
	{
		type: SESSION_TYPE,
		name: 'visited-url',
		displayName: 'Visited URL',
	},
	{
		type: SESSION_TYPE,
		name: 'os_name',
		displayName: 'Operating System',
	},
	{
		type: SESSION_TYPE,
		name: 'browser_name',
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
		name: 'Event',
		displayName: 'Error Body',
	},
] as const

export type Attribute = typeof ATTRIBUTES[number]

interface CommandBarState {
	currentAttribute: Attribute
	form: FormState<CommandBarSearch>
	touched: boolean
}

interface CommandBarAPI {
	setCurrentAttribute: (row: Attribute) => void
	setTouched: (isTouched: boolean) => void
}

export const [useCurrentAttribute, CurrentAttributeProvider] =
	createContext<CommandBarState['currentAttribute']>('CurrentAttribute')

export const [useCommandBarForm, CommandBarFormProvider] =
	createContext<CommandBarState['form']>('CommandBarForm')

export const [useCommandBarState, CommandBarStateProvider] = createContext<{
	touched: CommandBarState['touched']
}>('CommandBarState')

export const [useCommandBarAPI, CommandBarAPIProvider] =
	createContext<CommandBarAPI>('CommandBarAPI')

export const CommandBarContextProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const { commandBarDialog } = useGlobalContext()
	const formStore = Form.useStore<CommandBarSearch>({
		defaultValues: {
			search: '',
			selectedDates: [
				presetStartDate(DEFAULT_TIME_PRESETS[5]),
				moment().toDate(),
			],
			selectedPreset: presetValue(DEFAULT_TIME_PRESETS[5]),
		},
	})

	const query = formStore.useValue('search').trim()
	const searchAttribute = useAttributeSearch(formStore)

	formStore.useSubmit(() => {
		if (query) {
			searchAttribute(currentAttribute, {
				timeRange: {
					startDate: formStore.useValue('selectedDates')[0],
					endDate: formStore.useValue('selectedDates')[1],
					selectedPreset: formStore.useValue('selectedPreset'),
				},
			})
		}
	})

	const [currentAttribute, setCurrentAttributeImpl] = useState<Attribute>(
		ATTRIBUTES[0],
	)

	const [touched, setTouchedImpl] = useState(false)

	const api = useMemo(() => {
		const setCurrentAttribute = (row: Attribute) =>
			setCurrentAttributeImpl(row)
		const setTouched = (isTouched: boolean) => setTouchedImpl(isTouched)
		return {
			setTouched,
			setCurrentAttribute,
		}
	}, [])

	useEffect(() => {
		if (!query) {
			api.setTouched(false)
		}
		if (!touched) {
			api.setCurrentAttribute(ATTRIBUTES[validateEmail(query) ? 0 : 1])
		}
	}, [touched, query, api])

	useHotkeys(
		'cmd+k, ctrl+k, /',
		(e) => {
			e.preventDefault()
			formStore.reset()
			api.setCurrentAttribute(ATTRIBUTES[0])
			commandBarDialog.toggle()
		},
		[],
	)
	useHotkeys(
		'esc',
		() => {
			commandBarDialog.hide()
			api.setTouched(false)
		},
		[],
	)

	useHotkeys(
		'up',
		() => {
			api.setTouched(true)
			api.setCurrentAttribute(nextAttribute(currentAttribute, 'prev'))
		},
		[currentAttribute],
	)

	useHotkeys(
		'down',
		() => {
			api.setTouched(true)
			api.setCurrentAttribute(nextAttribute(currentAttribute, 'next'))
		},
		[currentAttribute],
	)

	return (
		<CurrentAttributeProvider value={currentAttribute}>
			<CommandBarAPIProvider value={api}>
				<CommandBarStateProvider value={{ touched }}>
					<CommandBarFormProvider value={formStore}>
						{children}
					</CommandBarFormProvider>
				</CommandBarStateProvider>
			</CommandBarAPIProvider>
		</CurrentAttributeProvider>
	)
}
