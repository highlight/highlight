import {
	OpenInNewTabShortcut,
	ShortcutTextGuide,
} from '@components/KeyboardShortcutsEducation/KeyboardShortcutsEducation'
import {
	Badge,
	Box,
	Form,
	IconSolidCalendar,
	IconSolidLightningBolt,
	IconSolidPlayCircle,
	IconSolidSearch,
	IconSolidSwitchVertical,
	Tag,
	Text,
	useFormState,
} from '@highlight-run/ui'
import { useWindowEvent } from '@hooks/useWindowEvent'
import { isInsideElement } from '@util/dom'
import { Dialog, useDialogState } from 'ariakit/dialog'
import { FormState } from 'ariakit/form'
import React from 'react'
import { useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useSet } from 'react-use'

import * as style from './style.css'

interface CommandBarSearch {
	search: string
}

enum CommandBarFilter {
	Sessions = 'sessions',
	Errors = 'errors',
}

const CommandBar = () => {
	const dialog = useDialogState({})
	const form = useFormState<CommandBarSearch>({
		defaultValues: {
			search: '',
		},
	})

	const containerRef = useRef<HTMLDivElement>(null)

	useHotkeys('cmd+k, /', dialog.toggle, [])
	useHotkeys('esc', dialog.hide, [])

	useWindowEvent('click', (evt) => {
		if (!isInsideElement(evt, containerRef.current)) {
			dialog.hide()
		}
	})

	const [, { toggle, has }] = useSet<CommandBarFilter>()

	return (
		<Dialog state={dialog} className={style.dialog}>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				ref={containerRef}
				background="white"
				borderRadius="8"
				flexDirection="column"
			>
				<SearchBar form={form} />
				<CommandBarFilters has={has} toggle={toggle} />
				<CommandBarHelp />
			</Box>
		</Dialog>
	)
}

const SearchBar = ({ form }: { form: FormState<CommandBarSearch> }) => {
	return (
		<Box p="8" display="flex" alignItems="center" width="full">
			<Form state={form}>
				<Box
					display="flex"
					justifyContent="space-between"
					align="center"
					as="label"
					gap="6"
					color="weak"
				>
					<IconSolidSearch size={16} className={style.searchIcon} />
					<Form.Input
						name={form.names.search}
						placeholder="Search..."
						size="xSmall"
						outline={false}
					/>
				</Box>
			</Form>
		</Box>
	)
}

const CommandBarFilters = ({
	has,
	toggle,
}: {
	has: (filter: CommandBarFilter) => boolean
	toggle: (filter: CommandBarFilter) => void
}) => {
	return (
		<Box display="flex" pt="4" pb="8" px="8" gap="6" width="full">
			<Tag
				kind={has(CommandBarFilter.Sessions) ? 'primary' : 'secondary'}
				iconLeft={<IconSolidPlayCircle />}
				onClick={() => toggle(CommandBarFilter.Sessions)}
				shape="basic"
				size="medium"
			>
				Sessions
			</Tag>
			<Tag
				kind={has(CommandBarFilter.Errors) ? 'primary' : 'secondary'}
				iconLeft={<IconSolidLightningBolt />}
				onClick={() => toggle(CommandBarFilter.Errors)}
				shape="basic"
				size="medium"
			>
				Errors
			</Tag>
			<Tag
				iconLeft={<IconSolidCalendar />}
				kind="secondary"
				shape="basic"
				size="medium"
			>
				Date
			</Tag>
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
				<Text size="xSmall" weight="medium" color="weak">
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
				<Text size="xSmall" weight="medium" color="weak">
					Open
				</Text>
			</Box>

			<Box display="flex" gap="4" alignItems="center">
				<ShortcutTextGuide shortcut={OpenInNewTabShortcut} />
				<Text size="xSmall" weight="medium" color="weak">
					Open in new tab
				</Text>
			</Box>
		</Box>
	)
})

export default CommandBar
