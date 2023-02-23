import {
	OpenInNewTabShortcut,
	ShortcutTextGuide,
} from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import {
	Badge,
	Box,
	Form,
	IconProps,
	IconSolidCalendar,
	IconSolidLightningBolt,
	IconSolidPlayCircle,
	IconSolidSearch,
	IconSolidSwitchVertical,
	IconSolidXCircle,
	Tag,
	Text,
	useFormState,
} from '@highlight-run/ui'
import { PreviousDateRangePicker } from '@highlight-run/ui/src/components/DatePicker/PreviousDateRangePicker'
import { useProjectId } from '@hooks/useProjectId'
import {
	ERROR_FIELD_TYPE,
	ERROR_TYPE,
} from '@pages/ErrorsV2/ErrorQueryBuilder/components/QueryBuilder/QueryBuilder'
import { SESSION_TYPE } from '@pages/Sessions/SessionsFeedV3/SessionQueryBuilder/components/QueryBuilder/QueryBuilder'
import { createContext } from '@util/context/context'
import { isInsideElement } from '@util/dom'
import { buildQueryURLString } from '@util/url/params'
import { Dialog, DialogState, useDialogState } from 'ariakit/dialog'
import { FormState } from 'ariakit/form'
import isEqual from 'lodash/isEqual'
import moment from 'moment'
import React, { useCallback, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'

import * as styles from './style.css'

interface CommandBarSearch {
	search: string
	selectedDates: Date[]
}

const ATTRIBUTE = [
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

type Attribute = typeof ATTRIBUTE[number]

interface CommandBarContext {
	currentAttribute: Attribute | undefined
	setCurrentAttribute: (row: Attribute | undefined) => void
	dialog: DialogState
}
export const [useCommandBarContext, CommandBarContextProvider] =
	createContext<CommandBarContext>('CommandBar')

const now = moment()

const last90Days = {
	startDate: now.clone().subtract(90, 'days').toDate(),
	label: 'Last 90 days',
}

const PRESETS = [
	{
		startDate: now.clone().subtract(60, 'minutes').toDate(),
		label: 'Last 60 minutes',
	},
	{
		startDate: now.clone().subtract(24, 'hours').toDate(),
		label: 'Last 24 hours',
	},
	{
		startDate: now.clone().subtract(7, 'days').toDate(),
		label: 'Last 7 days',
	},
	{
		startDate: now.clone().subtract(30, 'days').toDate(),
		label: 'Last 30 days',
	},
	last90Days,
]

const CommandBar = () => {
	const dialog = useDialogState({})
	const form = useFormState<CommandBarSearch>({
		defaultValues: {
			search: '',
			selectedDates: [last90Days.startDate, now.toDate()],
		},
	})

	const containerRef = useRef<HTMLDivElement>(null)
	const query = form.getValue<string>(form.names.search)
	const [currentAttribute, setCurrentAttributeImpl] = useState<
		Attribute | undefined
	>(undefined)

	const setCurrentAttribute = (row: Attribute | undefined) =>
		setCurrentAttributeImpl(row)

	const searchAttribute = useAttributeSearch(currentAttribute, query)

	useHotkeys(
		'cmd+k, ctrl+k, /',
		() => {
			setCurrentAttribute(undefined)
			form.reset()
			dialog.toggle()
		},
		[],
	)
	useHotkeys('esc', dialog.hide, [])

	useHotkeys(
		'up',
		() => {
			if (currentAttribute) {
				const index = ATTRIBUTE.indexOf(currentAttribute)
				setCurrentAttribute(ATTRIBUTE[index - 1] ?? ATTRIBUTE[0])
			}
		},
		[currentAttribute],
	)

	useHotkeys(
		'down',
		() => {
			if (currentAttribute) {
				const index = ATTRIBUTE.indexOf(currentAttribute)
				setCurrentAttribute(
					ATTRIBUTE[index + 1] ?? ATTRIBUTE[ATTRIBUTE.length - 1],
				)
			}
		},
		[currentAttribute],
	)

	useHotkeys(
		'enter',
		() => {
			searchAttribute()
			dialog.hide()
		},
		[currentAttribute, query],
	)

	useHotkeys(
		'cmd+enter, ctrl+enter',
		() => {
			searchAttribute({ newTab: true })
			dialog.hide()
		},
		[currentAttribute, query],
	)

	return (
		<CommandBarContextProvider
			value={{
				currentAttribute,
				setCurrentAttribute,
				dialog,
			}}
		>
			<Dialog
				state={dialog}
				className={styles.dialog}
				onClick={(e) => {
					if (!isInsideElement(e.nativeEvent, containerRef.current)) {
						dialog.hide()
					}
				}}
				onMouseMove={(e) => {
					if (!isInsideElement(e.nativeEvent, containerRef.current)) {
						setCurrentAttribute(undefined)
					}
				}}
			>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					ref={containerRef}
					background="white"
					borderRadius="8"
					flexDirection="column"
					cssClass={styles.container}
				>
					<SearchBar form={form} />

					{!!query ? (
						<>
							<SessionOptions query={query} />
							<ErrorOptions query={query} />
							<CommandBarHelp />
						</>
					) : null}
				</Box>
			</Dialog>
		</CommandBarContextProvider>
	)
}

const SearchBar = ({ form }: { form: FormState<CommandBarSearch> }) => {
	const query = form.getValue<string>(form.names.search)
	const inputRef = useRef<HTMLInputElement>(null)
	const isDirty =
		!!query ||
		form.getValue(form.names.selectedDates)[0].getTime() !==
			last90Days.startDate.getTime()

	const { setCurrentAttribute } = useCommandBarContext()

	return (
		<Box p="8" display="flex" alignItems="center" width="full">
			<Form state={form} className={styles.form}>
				<Box
					display="flex"
					justifyContent="space-between"
					align="center"
					as="label"
					gap="6"
					color="weak"
					width="full"
				>
					<IconSolidSearch size={16} className={styles.searchIcon} />
					<Box display="flex" gap="6" width="full">
						<Form.Input
							name={form.names.search}
							placeholder="Search..."
							size="xSmall"
							outline={false}
							width="full"
							ref={inputRef}
							autoComplete="off"
							onKeyDown={(e) => {
								if (!query) return
								if (
									e.code === 'ArrowDown' ||
									e.code === 'ArrowUp'
								) {
									inputRef.current?.blur()
								}
								if (e.code === 'ArrowDown') {
									setCurrentAttribute(ATTRIBUTE[0])
								} else if (e.code === 'ArrowUp') {
									setCurrentAttribute(
										ATTRIBUTE[ATTRIBUTE.length - 1],
									)
								}
							}}
						/>
						{isDirty ? (
							<IconSolidXCircle
								size={16}
								onClick={(e) => {
									e.preventDefault()
									e.stopPropagation()
									form.reset()
									form.setValue(form.names.selectedDates, [
										last90Days.startDate,
										now.toDate(),
									])
									inputRef.current?.focus()
								}}
							/>
						) : null}
					</Box>
					<PreviousDateRangePicker
						selectedDates={form.getValue(form.names.selectedDates)}
						onDatesChange={(dates) => {
							form.setValue(form.names.selectedDates, dates)
						}}
						presets={PRESETS}
						minDate={now.subtract(2, 'years').toDate()}
						emphasis="medium"
						cssClass={styles.datePicker}
						iconLeft={<IconSolidCalendar />}
					/>
				</Box>
			</Form>
		</Box>
	)
}

const SectionHeader = ({ header }: { header: string }) => {
	return (
		<Box pt="4" pb="2" px="8">
			<Text color="weak" size="xSmall" weight="medium" userSelect="none">
				{header}
			</Text>
		</Box>
	)
}

const useAttributeSearch = (
	attribute: Attribute | undefined,
	query: string,
) => {
	const navigate = useNavigate()
	const { projectId } = useProjectId()
	const callback = useCallback(
		(params?: { newTab?: boolean }) => {
			if (!attribute) return

			const basePath = `/${projectId}/${
				isErrorAttribute(attribute) ? 'errors' : 'sessions'
			}`
			const param = {
				[`${attribute.type}_${attribute.name}`]: `contains:${query}`,
			}

			if (!params?.newTab) {
				navigate({
					pathname: basePath,
					search: buildQueryURLString(param, {
						reload: true,
					}),
				})
			} else {
				window.open(
					`${basePath}${buildQueryURLString(param)}`,
					'_blank',
				)
			}
		},
		[attribute, navigate, projectId, query],
	)
	return callback
}
const SectionRow = ({
	icon,
	attribute,
	query,
}: {
	icon?: React.ReactElement<IconProps>
	attribute: Attribute
	query: string
}) => {
	const { currentAttribute, setCurrentAttribute, dialog } =
		useCommandBarContext()
	const selected = isEqual(currentAttribute, attribute)
	const searchAttribute = useAttributeSearch(attribute, query)

	return (
		<Box
			p="8"
			color="secondaryContentText"
			display="flex"
			alignItems="center"
			gap="8"
			overflow="hidden"
			cssClass={[
				styles.row,
				{
					[styles.rowSelected]: selected,
				},
			]}
			onMouseMove={() => {
				setCurrentAttribute(attribute)
			}}
			onClick={() => {
				searchAttribute()
				dialog.hide()
			}}
		>
			<Box flexShrink={0} display="inline-flex" alignItems="center">
				{icon}
			</Box>
			<Box display="inline-flex" gap="1">
				<Tag
					size="medium"
					kind="secondary"
					shape="basic"
					className={styles.flatRight}
				>
					{attribute.displayName}
				</Tag>
				<Tag
					size="medium"
					kind="secondary"
					shape="basic"
					className={styles.flatLeft}
				>
					contains
				</Tag>
			</Box>
			<Text
				size="small"
				userSelect="none"
				weight="medium"
				lines="1"
				cssClass={styles.query}
			>
				{query}
			</Text>
		</Box>
	)
}

const isSessionAttribute = (attribute: typeof ATTRIBUTE[number]) => {
	return ['user', SESSION_TYPE].includes(attribute.type)
}
const SessionOptions = ({ query }: { query: string }) => {
	return (
		<Box
			display="flex"
			flexDirection="column"
			py="4"
			width="full"
			bt="dividerWeak"
		>
			<SectionHeader header="Sessions" />
			{ATTRIBUTE.filter(isSessionAttribute).map((attribute, idx) => {
				return (
					<SectionRow
						key={`sessions-${idx}`}
						attribute={attribute}
						query={query}
						icon={<IconSolidPlayCircle size={16} />}
					/>
				)
			})}
		</Box>
	)
}

const isErrorAttribute = (attribute: typeof ATTRIBUTE[number]) => {
	return [ERROR_TYPE, ERROR_FIELD_TYPE].includes(attribute.type)
}

const ErrorOptions = ({ query }: { query: string }) => {
	return (
		<Box display="flex" flexDirection="column" py="4" width="full">
			<SectionHeader header="Errors" />
			{ATTRIBUTE.filter(isErrorAttribute).map((attribute, idx) => (
				<SectionRow
					key={`errors-${idx}`}
					attribute={attribute}
					query={query}
					icon={<IconSolidLightningBolt size={16} />}
				/>
			))}
		</Box>
	)
}

const CommandBarHelp = React.memo(() => {
	return (
		<Box
			display="flex"
			px="8"
			py="4"
			gap="20"
			bt="dividerWeak"
			width="full"
		>
			<Box display="flex" gap="4" alignItems="center">
				<Badge
					shape="basic"
					size="small"
					variant="gray"
					iconStart={<IconSolidSwitchVertical />}
				/>
				<Text
					size="xSmall"
					weight="medium"
					color="weak"
					userSelect="none"
				>
					Select
				</Text>
			</Box>

			<Box display="flex" gap="4" alignItems="center">
				<Badge
					shape="basic"
					size="small"
					variant="gray"
					label="Enter"
				/>
				<Text
					size="xSmall"
					weight="medium"
					color="weak"
					userSelect="none"
				>
					Open
				</Text>
			</Box>

			<Box display="flex" gap="4" alignItems="center">
				<ShortcutTextGuide shortcut={OpenInNewTabShortcut} />
				<Text
					size="xSmall"
					weight="medium"
					color="weak"
					userSelect="none"
				>
					Open in new tab
				</Text>
			</Box>
		</Box>
	)
})

export default CommandBar
