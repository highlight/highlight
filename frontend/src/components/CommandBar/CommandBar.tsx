import {
	Attribute,
	ATTRIBUTES,
	CommandBarContextProvider,
	CommandBarSearch,
	useCommandBarContext,
} from '@components/CommandBar/context'
import {
	isErrorAttribute,
	isSessionAttribute,
	nextAttribute,
	useAttributeSearch,
} from '@components/CommandBar/utils'
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
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import { isInsideElement } from '@util/dom'
import { Dialog } from 'ariakit/dialog'
import { FormState } from 'ariakit/form'
import isEqual from 'lodash/isEqual'
import moment from 'moment'
import React, { useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

import * as styles from './style.css'

const now = moment().startOf('day')

const last30Days = {
	startDate: now.clone().subtract(30, 'days').toDate(),
	label: 'Last 30 days',
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
	last30Days,
	{
		startDate: now.clone().subtract(90, 'days').toDate(),
		label: 'Last 90 days',
	},
	{
		startDate: now.clone().subtract(1, 'y').toDate(),
		label: 'Last year',
	},
]

const CommandBar = () => {
	const { commandBarDialog } = useGlobalContext()
	const form = useFormState<CommandBarSearch>({
		defaultValues: {
			search: '',
			selectedDates: [last30Days.startDate, moment().toDate()],
		},
	})

	const containerRef = useRef<HTMLDivElement>(null)
	const query = form.getValue<string>(form.names.search)
	const selectedDates = form.getValue<[Date, Date]>(form.names.selectedDates)
	const [currentAttribute, setCurrentAttributeImpl] = useState<Attribute>(
		ATTRIBUTES[0],
	)

	const setCurrentAttribute = (row: Attribute) => setCurrentAttributeImpl(row)

	const searchAttribute = useAttributeSearch(form)

	form.useSubmit(() => {
		if (query) {
			searchAttribute(currentAttribute, {
				withDate:
					selectedDates[0].getTime() !==
					last30Days.startDate.getTime(),
			})
		}
	})

	useHotkeys(
		'cmd+k, ctrl+k, /',
		(e) => {
			e.preventDefault()
			form.reset()
			setCurrentAttribute(ATTRIBUTES[0])
			commandBarDialog.toggle()
		},
		[],
	)
	useHotkeys('esc', commandBarDialog.hide, [])

	useHotkeys(
		'up',
		() => {
			setCurrentAttribute(nextAttribute(currentAttribute, 'prev'))
		},
		[currentAttribute],
	)

	useHotkeys(
		'down',
		() => {
			setCurrentAttribute(nextAttribute(currentAttribute, 'next'))
		},
		[currentAttribute],
	)

	return (
		<CommandBarContextProvider
			value={{
				currentAttribute,
				setCurrentAttribute,
				form,
			}}
		>
			<Dialog
				state={commandBarDialog}
				className={styles.dialog}
				onClick={(e) => {
					if (!isInsideElement(e.nativeEvent, containerRef.current)) {
						commandBarDialog.hide()
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
					position="absolute"
				>
					<SearchBar form={form} />

					{!!query ? (
						<>
							<SessionOptions />
							<ErrorOptions />
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
	const selectedDates = form.getValue<Date[]>(form.names.selectedDates)

	const inputRef = useRef<HTMLInputElement>(null)
	const isDirty =
		!!query || selectedDates[0].getTime() !== last30Days.startDate.getTime()

	const { currentAttribute, setCurrentAttribute } = useCommandBarContext()
	const searchAttribute = useAttributeSearch(form)

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
									e.preventDefault()
									setCurrentAttribute(
										nextAttribute(
											currentAttribute,
											e.code === 'ArrowUp'
												? 'prev'
												: 'next',
										),
									)
								}
								if (e.code === 'Enter') {
									e.preventDefault()
									if (e.metaKey || e.ctrlKey) {
										searchAttribute(currentAttribute, {
											newTab: true,
											withDate:
												selectedDates[0].getTime() !==
												last30Days.startDate.getTime(),
										})
									} else {
										form.submit()
									}
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
						minDate={now.clone().subtract(2, 'years').toDate()}
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

const SectionRow = ({
	icon,
	attribute,
}: {
	icon?: React.ReactElement<IconProps>
	attribute: Attribute
}) => {
	const { currentAttribute, setCurrentAttribute, form } =
		useCommandBarContext()
	const selected = isEqual(currentAttribute, attribute)
	const searchAttribute = useAttributeSearch(form)

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
			onClick={(e) => {
				searchAttribute(attribute, {
					withDate:
						form.getValue(form.names.selectedDates)[0].getTime() !==
						last30Days.startDate.getTime(),
					newTab: e.metaKey || e.ctrlKey,
				})
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
				{form.getValue(form.names.search)}
			</Text>
			{selected ? (
				<Badge
					shape="basic"
					size="small"
					variant="outlineGray"
					label="Enter"
					ml="auto"
				/>
			) : null}
		</Box>
	)
}

const SessionOptions = () => {
	return (
		<Box
			display="flex"
			flexDirection="column"
			py="4"
			width="full"
			bt="dividerWeak"
		>
			<SectionHeader header="Sessions" />
			{ATTRIBUTES.filter(isSessionAttribute).map((attribute, idx) => {
				return (
					<SectionRow
						key={`sessions-${idx}`}
						attribute={attribute}
						icon={<IconSolidPlayCircle size={16} />}
					/>
				)
			})}
		</Box>
	)
}

const ErrorOptions = () => {
	return (
		<Box display="flex" flexDirection="column" py="4" width="full">
			<SectionHeader header="Errors" />
			{ATTRIBUTES.filter(isErrorAttribute).map((attribute, idx) => (
				<SectionRow
					key={`errors-${idx}`}
					attribute={attribute}
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
