import ButtonLink from '@components/Button/ButtonLink/ButtonLink'
import ElevatedCard from '@components/ElevatedCard/ElevatedCard'
import Input from '@components/Input/Input'
import TextHighlighter from '@components/TextHighlighter/TextHighlighter'
import SvgSearchIcon from '@icons/SearchIcon'
import { PLAYBACK_SPEED_INCREMENT } from '@pages/Player/Toolbar/SpeedControl/SpeedControl'
import { PLAYER_SKIP_DURATION } from '@pages/Player/utils/PlayerHooks'
import { useGlobalContext } from '@routers/OrgRouter/context/GlobalContext'
import classNames from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { H } from 'highlight.run'
import React, { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useLocation } from 'react-router'

import styles from './KeyboardShortcutsEducation.module.scss'

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
				H.track('ViewedKeyboardShortcutsGuide')
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

	const isOnSessionPlayerPage = location.pathname.includes('sessions')
	const hasNoSearchHits =
		filteredPlayerKeyboardShortcuts.length === 0 &&
		filteredGeneralKeyboardShortcuts.length === 0

	return (
		<AnimatePresence presenceAffectsLayout>
			{showKeyboardShortcutsGuide && (
				<>
					<motion.div
						key="backdrop"
						className={classNames(styles.backdrop)}
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
										href="https://feedback.highlight.run/feature-requests"
										trackingId="SuggestKeyboardShortcut"
										className={styles.suggestionButton}
									>
										Suggest a Shortcut
									</ButtonLink>
								</div>
							}
							className={classNames(styles.elevatedCard)}
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

								{!isOnSessionPlayerPage && !hasNoSearchHits && (
									<section>
										<h3 className={styles.emptyTitle}>
											{
												location.pathname
													.split('/')
													.reverse()[0]
											}{' '}
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
											href="https://feedback.highlight.run/feature-requests"
											trackingId="SuggestKeyboardShortcutFromSearch"
											className={classNames(
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
									<section>
										<h3>General</h3>

										<table>
											<tbody>
												{filteredGeneralKeyboardShortcuts.map(
													(shortcut) => (
														<tr
															key={
																shortcut.description
															}
														>
															<td
																className={
																	styles.description
																}
															>
																<TextHighlighter
																	searchWords={searchQuery.split(
																		' ',
																	)}
																	textToHighlight={
																		shortcut.description
																	}
																/>
															</td>
															<td
																className={
																	styles.shortcutContainer
																}
															>
																<KeyboardShortcut
																	shortcut={
																		shortcut.shortcut
																	}
																/>
															</td>
														</tr>
													),
												)}
											</tbody>
										</table>
									</section>
								)}

								{filteredPlayerKeyboardShortcuts.length > 0 && (
									<section
										className={classNames({
											[styles.disabled]:
												!isOnSessionPlayerPage,
										})}
									>
										<h3>Session Player Page</h3>

										<table>
											<tbody>
												{filteredPlayerKeyboardShortcuts.map(
													(shortcut) => (
														<tr
															key={
																shortcut.description
															}
														>
															<td
																className={
																	styles.description
																}
															>
																<TextHighlighter
																	searchWords={searchQuery.split(
																		' ',
																	)}
																	textToHighlight={
																		shortcut.description
																	}
																/>
															</td>
															<td
																className={
																	styles.shortcutContainer
																}
															>
																<KeyboardShortcut
																	shortcut={
																		shortcut.shortcut
																	}
																/>
															</td>
														</tr>
													),
												)}
											</tbody>
										</table>
									</section>
								)}
							</main>
						</ElevatedCard>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	)
}

export default KeyboardShortcutsEducation

const KeyboardShortcut = ({ shortcut }: Pick<ShortcutItem, 'shortcut'>) => {
	return (
		<span className={styles.kbdContainer}>
			{shortcut.map((key) => (
				<kbd
					key={key}
					className={classNames(styles.kbd, {
						[styles.symbol]: key === '⌘',
					})}
				>
					{key}
				</kbd>
			))}
		</span>
	)
}

interface ShortcutItem {
	description: string
	shortcut: string[]
}

const isOnMac = window.navigator.platform.includes('Mac')

const GeneralKeyboardShortcuts: ShortcutItem[] = [
	{
		description: 'Open Keyboard Shortcuts Guide',
		shortcut: ['?'],
	},
]

const PlayerKeyboardShortcuts: ShortcutItem[] = [
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
	{
		description: `Play the next session`,
		shortcut: ['shift', 'N'],
	},
	{
		description: `Play the previous session`,
		shortcut: ['shift', 'P'],
	},
	{
		description: `Decrease the playback speed by ${PLAYBACK_SPEED_INCREMENT}x`,
		shortcut: ['shift', ','],
	},
	{
		description: `Increase the playback speed by ${PLAYBACK_SPEED_INCREMENT}x`,
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
		shortcut: [isOnMac ? '⌘' : 'Ctrl', 'b'],
	},
	{
		description: `Toggle right sidebar`,
		shortcut: [isOnMac ? '⌘' : 'Ctrl', 'i'],
	},
]
