import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import ElevatedCard from '@components/ElevatedCard/ElevatedCard'
import Input from '@components/Input/Input'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import { Badge, Box } from '@highlight-run/ui/components'
import SvgSearchIcon from '@icons/SearchIcon'
import { PLAYER_SKIP_DURATION } from '@pages/Player/utils/PlayerHooks'
import { useGlobalContext } from '@routers/ProjectRouter/context/GlobalContext'
import analytics from '@util/analytics'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useLocation } from 'react-router-dom'

import styles from './KeyboardShortcutsEducation.module.css'

const KeyboardShortcutsEducation = () => {
	const location = useLocation()
	const [searchQuery, setSearchQuery] = useState('')
	const { showKeyboardShortcutsGuide, toggleShowKeyboardShortcutsGuide } =
		useGlobalContext()

	useHotkeys(
		'shift+/',
		(e) => {
			e.stopPropagation()
			e.preventDefault()
			window.focus()

			if (
				document.activeElement &&
				document.activeElement instanceof HTMLElement
			) {
				document.activeElement.blur()
			}

			if (showKeyboardShortcutsGuide) {
				analytics.track('ViewedKeyboardShortcutsGuide')
			}
			toggleShowKeyboardShortcutsGuide()
		},
		[showKeyboardShortcutsGuide],
	)

	useHotkeys(
		'esc',
		(e) => {
			e.stopPropagation()
			e.preventDefault()
			window.focus()

			if (
				document.activeElement &&
				document.activeElement instanceof HTMLElement
			) {
				document.activeElement.blur()
			}

			if (showKeyboardShortcutsGuide) {
				toggleShowKeyboardShortcutsGuide()
			}
		},
		[showKeyboardShortcutsGuide],
	)

	const filteredPlayerKeyboardShortcuts = PlayerKeyboardShortcuts.filter(
		({ description }) => {
			return description
				.toLocaleLowerCase()
				.includes(searchQuery.toLocaleLowerCase())
		},
	)
	const filteredGeneralKeyboardShortcuts = GeneralKeyboardShortcuts.filter(
		({ description }) => {
			return description
				.toLocaleLowerCase()
				.includes(searchQuery.toLocaleLowerCase())
		},
	)
	const filteredErrorsKeyboardShortcuts = ErrorsKeyboardShortcuts.filter(
		({ description }) => {
			return description
				.toLocaleLowerCase()
				.includes(searchQuery.toLocaleLowerCase())
		},
	)

	const isOnSessionPlayerPage = location.pathname.includes('sessions')
	const isOnErrorsPage = location.pathname.includes('errors')
	const hasNoSearchHits =
		filteredPlayerKeyboardShortcuts.length === 0 &&
		filteredGeneralKeyboardShortcuts.length === 0 &&
		filteredErrorsKeyboardShortcuts.length === 0

	const playerShortcuts = filteredPlayerKeyboardShortcuts.length > 0 && (
		<KeyboardShortcutDoc
			title="Session Player Page"
			shortcuts={filteredPlayerKeyboardShortcuts}
			searchQuery={searchQuery}
			disabled={!isOnSessionPlayerPage}
		/>
	)

	const errorShortcuts = filteredErrorsKeyboardShortcuts.length > 0 && (
		<KeyboardShortcutDoc
			title="Errors Page"
			shortcuts={filteredErrorsKeyboardShortcuts}
			searchQuery={searchQuery}
			disabled={!isOnErrorsPage}
		/>
	)

	return (
		<AnimatePresence presenceAffectsLayout>
			{showKeyboardShortcutsGuide && (
				<>
					<motion.div
						key="backdrop"
						className={clsx(styles.backdrop)}
						onClick={() => {
							if (showKeyboardShortcutsGuide) {
								toggleShowKeyboardShortcutsGuide()
							}
						}}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					></motion.div>

					<motion.div
						key="ShortcutsCard"
						initial={{ transform: 'translateX(110%)' }}
						animate={{ transform: 'translateX(0%)' }}
						exit={{ transform: 'translateX(110%)' }}
						className={styles.elevatedCardMotion}
					>
						<ElevatedCard
							title={
								<div className={styles.titleContainer}>
									Shortcuts{' '}
									<ButtonLink
										anchor
										href="https://highlight.io/community"
										trackingId="SuggestKeyboardShortcut"
										className={styles.suggestionButton}
									>
										Suggest a Shortcut
									</ButtonLink>
								</div>
							}
							className={clsx(styles.elevatedCard)}
						>
							<main className={styles.container}>
								<Input
									placeholder="Search"
									suffix={
										<SvgSearchIcon
											className={styles.searchIcon}
										/>
									}
									onChange={(e) => {
										setSearchQuery(e.target.value)
									}}
									allowClear
								/>

								{!isOnSessionPlayerPage && hasNoSearchHits && (
									<section>
										<h3 className={styles.emptyTitle}>
											{location.pathname.split('/')[2]}{' '}
											Page
										</h3>

										<p>
											There are no keyboard shortcuts for
											this page.
										</p>
									</section>
								)}

								{hasNoSearchHits && (
									<section>
										<p className={styles.emptyDescription}>
											No keyboard results matching '
											{searchQuery}
											'.
										</p>
										<ButtonLink
											anchor
											href="https://highlight.io/community"
											trackingId="SuggestKeyboardShortcutFromSearch"
											className={clsx(
												styles.suggestionButton,
												styles.cta,
											)}
										>
											Suggest a Shortcut
										</ButtonLink>
									</section>
								)}

								{filteredGeneralKeyboardShortcuts.length >
									0 && (
									<KeyboardShortcutDoc
										title="General"
										shortcuts={
											filteredGeneralKeyboardShortcuts
										}
										searchQuery={searchQuery}
										disabled={false}
									/>
								)}

								{isOnErrorsPage ? (
									<>
										{errorShortcuts}
										{playerShortcuts}
									</>
								) : (
									<>
										{playerShortcuts}
										{errorShortcuts}
									</>
								)}
							</main>
						</ElevatedCard>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	)
}

const KeyboardShortcutDoc: React.FC<{
	title: string
	searchQuery: string
	shortcuts: ShortcutItem[]
	disabled?: boolean
}> = ({ disabled, title, searchQuery, shortcuts }) => {
	return (
		<section
			className={clsx({
				[styles.disabled]: disabled,
			})}
		>
			<h3>{title}</h3>

			<table>
				<tbody>
					{shortcuts.map((shortcut) => (
						<tr key={shortcut.description}>
							<td className={styles.description}>
								<TextHighlighter
									searchWords={searchQuery.split(' ')}
									textToHighlight={shortcut.description}
								/>
							</td>
							<td className={styles.shortcutContainer}>
								<KeyboardShortcut
									shortcut={shortcut.shortcut}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	)
}

export default KeyboardShortcutsEducation

const KeyboardShortcut = ({ shortcut }: Pick<ShortcutItem, 'shortcut'>) => {
	return (
		<span className={styles.kbdContainer}>
			{shortcut.map((key) => (
				<kbd
					key={key}
					className={clsx(styles.kbd, {
						[styles.symbol]: key === '⌘',
					})}
				>
					{key}
				</kbd>
			))}
		</span>
	)
}

export interface ShortcutItem {
	description: string
	shortcut: string[]
}

const isOnMac = window.navigator.userAgent.includes('Mac')
export const cmdKey = isOnMac ? '⌘' : 'Ctrl'

export const GeneralKeyboardShortcuts: ShortcutItem[] = [
	{
		description: 'Open Keyboard Shortcuts Guide',
		shortcut: ['?'],
	},
]

export const DevToolsShortcut: ShortcutItem = {
	description: `Toggle dev tools`,
	shortcut: [cmdKey, '/'],
}

export const TimelineShortcut: ShortcutItem = {
	description: `Toggle the timeline`,
	shortcut: [cmdKey, 'E'],
}

export const OpenInNewTabShortcut: ShortcutItem = {
	description: `Toggle the timeline`,
	shortcut: [cmdKey, 'Enter'],
}

export const PlayerKeyboardShortcuts: ShortcutItem[] = [
	{
		description: 'Play or pause the video',
		shortcut: ['space'],
	},
	{
		description: `Set the video time ${
			PLAYER_SKIP_DURATION / 1000
		} seconds backwards`,
		shortcut: ['left'],
	},
	{
		description: `Set the video time ${
			PLAYER_SKIP_DURATION / 1000
		} seconds forwards`,
		shortcut: ['right'],
	},
	TimelineShortcut,
	DevToolsShortcut,
	{
		description: `Play the next session`,
		shortcut: ['shift', 'N'],
	},
	{
		description: `Play the previous session`,
		shortcut: ['shift', 'P'],
	},
	{
		description: `Decrease the playback speed`,
		shortcut: ['shift', ','],
	},
	{
		description: `Increase the playback speed`,
		shortcut: ['shift', '.'],
	},
	{
		description: `Toggle fullscreen`,
		shortcut: ['f'],
	},
	{
		description: `Enable commenting`,
		shortcut: ['c'],
	},
	{
		description: `Inspect element`,
		shortcut: ['d'],
	},
	{
		description: `Toggle left sidebar`,
		shortcut: [cmdKey, 'b'],
	},
	{
		description: `Toggle right sidebar`,
		shortcut: [cmdKey, 'i'],
	},
]

export const ErrorsKeyboardShortcuts: ShortcutItem[] = [
	{
		description: `Toggle left sidebar`,
		shortcut: [cmdKey, 'b'],
	},
	{
		description: `Next error`,
		shortcut: ['j'],
	},
	{
		description: `Previous error`,
		shortcut: ['k'],
	},
	{
		description: `Next error instance`,
		shortcut: [']'],
	},
	{
		description: `Previous error instance`,
		shortcut: ['['],
	},
	{
		description: `Toggle error status menu`,
		shortcut: ['e'],
	},
	{
		description: `Go to Instances tab`,
		shortcut: ['i'],
	},
	{
		description: `Go to Metrics tab`,
		shortcut: ['m'],
	},
]

type ShortcutGuideProps = {
	shortcut: ShortcutItem
	className?: string
}

export const ShortcutTextGuide: React.FC<ShortcutGuideProps> = React.memo(
	({ shortcut, className }) => {
		return (
			<Box display="flex" gap="2" cssClass={className}>
				{shortcut.shortcut.map((char, idx) => (
					<Badge key={idx} variant="gray" size="small" label={char} />
				))}
			</Box>
		)
	},
)
