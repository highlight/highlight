import { last30Days, now, PRESETS } from '@components/CommandBar/constants'
import {
	Attribute,
	ATTRIBUTES,
	CommandBarContextProvider,
	useCommandBarAPI,
	useCommandBarForm,
	useCurrentAttribute,
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
	Ariakit,
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
} from '@highlight-run/ui'
import { PreviousDateRangePicker } from '@highlight-run/ui/src/components/DatePicker/PreviousDateRangePicker'
import { useHTMLElementEvent } from '@hooks/useHTMLElementEvent'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import { isInsideElement } from '@util/dom'
import isEqual from 'lodash/isEqual'
import React, { useRef } from 'react'

import * as styles from './style.css'

const CommandBar = () => {
	return (
		<CommandBarContextProvider>
			<CommandBarBox />
		</CommandBarContextProvider>
	)
}

const CommandBarBox = () => {
	const containerRef = useRef<HTMLDivElement>(null)
	const { setTouched } = useCommandBarAPI()

	const { commandBarDialog } = useGlobalContext()
	return (
		<Ariakit.Dialog
			store={commandBarDialog}
			className={styles.dialog}
			backdrop={<Box cssClass={styles.dialogBackdrop} />}
			onClick={(e) => {
				if (!isInsideElement(e.nativeEvent, containerRef.current)) {
					setTouched(false)
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
				<SearchBar />
				<SearchOptions />
			</Box>
		</Ariakit.Dialog>
	)
}
const SearchOptions = () => {
	const formStore = useCommandBarForm()
	const query = formStore.useValue(formStore.names.search).trim()
	if (!query) return null
	return (
		<>
			<SessionOptions />
			<ErrorOptions />
			<CommandBarHelp />
		</>
	)
}

const SearchBar = () => {
	const formStore = useCommandBarForm()
	const query = formStore.useValue(formStore.names.search).trim()
	const selectedDates = formStore.useValue<Date[]>(
		formStore.names.selectedDates,
	)

	const inputRef = useRef<HTMLInputElement>(null)
	const isDirty =
		!!query || selectedDates[0].getTime() !== last30Days.startDate.getTime()

	const searchAttribute = useAttributeSearch(formStore)

	const currentAttribute = useCurrentAttribute()
	const { setCurrentAttribute } = useCommandBarAPI()

	useHTMLElementEvent(inputRef.current, 'keydown', (e) => {
		if (!query) return

		if (e.code === 'ArrowDown' || e.code === 'ArrowUp') {
			e.preventDefault()
			setCurrentAttribute(
				nextAttribute(
					currentAttribute,
					e.code === 'ArrowUp' ? 'prev' : 'next',
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
				formStore.submit()
			}
		}
	})

	return (
		<Box p="8" display="flex" alignItems="center" width="full">
			<Form store={formStore} className={styles.form}>
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
					<Box
						display="flex"
						gap="6"
						width="full"
						alignItems="center"
					>
						<Form.Input
							name={formStore.names.search}
							placeholder="Search..."
							size="xSmall"
							outline={false}
							width="full"
							ref={inputRef}
							autoComplete="off"
							autoFocus
						/>
						{isDirty ? (
							<IconSolidXCircle
								size={16}
								onClick={(e) => {
									e.preventDefault()
									e.stopPropagation()
									formStore.reset()
									inputRef.current?.focus()
								}}
							/>
						) : null}
					</Box>
					<PreviousDateRangePicker
						selectedDates={formStore.useValue(
							formStore.names.selectedDates,
						)}
						onDatesChange={(dates) => {
							formStore.setValue(
								formStore.names.selectedDates,
								dates,
							)
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
	const { setCurrentAttribute, setTouched } = useCommandBarAPI()
	const currentAttribute = useCurrentAttribute()
	const formStore = useCommandBarForm()
	const selected = isEqual(currentAttribute, attribute)
	const searchAttribute = useAttributeSearch(formStore)

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
				setTouched(true)
				setCurrentAttribute(attribute)
			}}
			onClick={(e) => {
				setTouched(true)
				searchAttribute(attribute, {
					withDate:
						formStore
							.useValue(formStore.names.selectedDates)[0]
							.getTime() !== last30Days.startDate.getTime(),
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
				{formStore.useValue(formStore.names.search).trim()}
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
