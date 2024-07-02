import {
	Box,
	Combobox,
	DateRangePicker,
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
	IconSolidCheck,
	IconSolidClock,
	IconSolidExclamation,
	IconSolidLoading,
	IconSolidPencil,
	IconSolidPencilAlt,
	IconSolidRefresh,
	IconSolidSparkles,
	IconSolidX,
	Stack,
	Text,
	useComboboxStore,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import clsx from 'clsx'
import moment from 'moment'
import React, { useMemo, useRef, useState } from 'react'
import TextareaAutosize from 'react-autosize-textarea'

import { Button } from '@/components/Button'
import { loadingIcon } from '@/components/Button/style.css'
import { useSearchContext } from '@/components/Search/SearchContext'
import { QueryPart } from '@/components/Search/SearchForm/QueryPart'
import { buildTokenGroups } from '@/components/Search/SearchForm/utils'
import { parseSearch } from '@/components/Search/utils'

import * as styles from './style.css'

type DateSuggestion = {
	startDate: Date
	endDate: Date
	selectedPreset?: DateRangePreset
}

export const AiSearch: React.FC<any> = ({}) => {
	const {
		setAiMode,
		aiQuery,
		setAiQuery,
		onAiSubmit,
		aiSuggestion,
		aiSuggestionLoading,
		aiSuggestionError,
		onSubmit,
		startDate,
		endDate,
		selectedPreset,
		updateSearchTime,
	} = useSearchContext()
	const [submitted, setSubmitted] = useState(false)
	const displayError = !!aiSuggestionError && submitted
	const displayTags = !aiSuggestionLoading && !displayError && submitted

	const inputRef = useRef<HTMLTextAreaElement | null>(null)
	const comboboxStore = useComboboxStore({
		defaultValue: aiQuery,
	})

	const submitQuery = (query: string) => {
		onAiSubmit(query)
		setSubmitted(true)
	}

	const searchSubmittedQuery = () => {
		if (aiSuggestion) {
			onSubmit(aiSuggestion.query)
			updateSearchTime!(
				dateSuggestion.startDate,
				dateSuggestion.endDate,
				dateSuggestion.selectedPreset,
			)
			setAiMode(false)
			setAiQuery('')
		}
	}

	const getValue = () => {
		if (aiSuggestionLoading) {
			return 'Harold AI is thinking...'
		}

		if (displayError) {
			return `Oops... there was an issue. ${aiSuggestionError}`
		}

		if (submitted) {
			return aiSuggestion?.query
		}

		return aiQuery
	}

	const aiSuggestionTokenGroups = useMemo(() => {
		if (!aiSuggestion?.query) {
			return []
		}

		const { tokens } = parseSearch(aiSuggestion.query)
		const tokenGroups = buildTokenGroups(tokens)

		return tokenGroups
	}, [aiSuggestion])

	const Icon = () => {
		if (aiSuggestionLoading) {
			return (
				<IconSolidLoading
					className={clsx(styles.searchIcon, loadingIcon)}
				/>
			)
		}

		if (displayError) {
			return (
				<IconSolidExclamation
					className={styles.searchIcon}
					color={vars.theme.interactive.fill.bad.enabled}
				/>
			)
		}

		return (
			<IconSolidSparkles
				className={styles.searchIcon}
				color={vars.theme.interactive.fill.primary.enabled}
			/>
		)
	}

	const dateSuggestion = useMemo(() => {
		if (aiSuggestion) {
			const { dateRange } = aiSuggestion

			const suggestedStartDate = dateRange.startDate
				? new Date(dateRange.startDate)
				: new Date(startDate!)

			const suggestedEndDate = dateRange.endDate
				? new Date(dateRange.endDate)
				: new Date(endDate!)

			const suggestedDates = {
				startDate: suggestedStartDate,
				endDate: suggestedEndDate,
			} as DateSuggestion

			if (!dateRange.startDate && !dateRange.endDate) {
				suggestedDates.selectedPreset = selectedPreset
			}

			return suggestedDates
		}

		return {} as DateSuggestion
	}, [aiSuggestion, endDate, selectedPreset, startDate])

	return (
		<Box
			alignItems="stretch"
			display="flex"
			flexGrow={1}
			position="relative"
			cssClass={clsx(styles.container, {
				[styles.containerError]: !!displayError,
			})}
		>
			<Icon />
			<Box
				display="flex"
				alignItems="center"
				gap="6"
				width="full"
				color="weak"
				position="relative"
				margin="auto"
			>
				{displayTags && (
					<Box
						cssClass={styles.comboboxTagsContainer}
						style={{
							left: 2,
							paddingLeft: 38,
						}}
					>
						{aiSuggestionTokenGroups.map((tokenGroup, index) => {
							if (tokenGroup.tokens.length === 0) {
								return null
							}

							return (
								<QueryPart
									key={index}
									typeaheadOpen={false}
									cursorIndex={0}
									index={index}
									tokenGroup={tokenGroup}
									showValues={false}
									showErrors={false}
								/>
							)
						})}
					</Box>
				)}
				<Combobox
					store={comboboxStore}
					disabled={submitted}
					name="aiSearch"
					placeholder="e.g. 'logs with level error in the last 24 hours'"
					className={clsx(styles.combobox, {
						[styles.comboboxError]: displayError,
						[styles.comboboxWithTags]: displayTags,
					})}
					render={
						<TextareaAutosize
							ref={inputRef}
							style={{
								resize: 'none',
								overflowY: 'hidden',
							}}
							spellCheck={false}
						/>
					}
					value={getValue()}
					onChange={(e) => {
						setAiQuery(e.target.value)
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault()
							submitQuery(aiQuery)
						}
						if (e.key === 'Escape') {
							setAiMode(false)
						}
					}}
					style={{
						paddingLeft: 40,
						top: 6,
					}}
					autoFocus
					data-hl-record
				/>
			</Box>

			<Box>
				{!aiSuggestionLoading && submitted && (
					<Combobox.Popover
						className={styles.comboboxPopover}
						style={{
							left: 6,
						}}
						store={comboboxStore}
						gutter={10}
						open
						sameWidth
					>
						<Box cssClass={styles.comboboxResults}>
							{!displayError && (
								<Combobox.Group
									className={styles.comboboxGroup}
									store={comboboxStore}
								>
									<Combobox.Item
										className={styles.comboboxItem}
										onClick={() => searchSubmittedQuery()}
										store={comboboxStore}
									>
										<Stack
											direction="row"
											gap="4"
											align="center"
										>
											<IconSolidCheck />
											<Text color="weak" size="small">
												Accept query
											</Text>
										</Stack>
									</Combobox.Item>
									<Combobox.Item
										className={styles.comboboxItem}
										// TODO: be able to just copy query and dates over
										// without running query
										onClick={() => searchSubmittedQuery()}
										store={comboboxStore}
									>
										<Stack
											direction="row"
											gap="4"
											align="center"
										>
											<IconSolidPencilAlt />
											<Text color="weak" size="small">
												Edit query
											</Text>
										</Stack>
									</Combobox.Item>
								</Combobox.Group>
							)}
							<Combobox.Group
								className={styles.comboboxGroup}
								store={comboboxStore}
							>
								<Combobox.Item
									className={styles.comboboxItem}
									onClick={() => setSubmitted(false)}
									store={comboboxStore}
								>
									<Stack
										direction="row"
										gap="4"
										align="center"
									>
										<IconSolidPencil />
										<Text color="weak" size="small">
											Edit prompt
										</Text>
									</Stack>
								</Combobox.Item>
								<Combobox.Item
									className={styles.comboboxItem}
									onClick={() => submitQuery(aiQuery)}
									store={comboboxStore}
								>
									<Stack
										direction="row"
										gap="4"
										align="center"
									>
										<IconSolidRefresh />
										<Text color="weak" size="small">
											Regenerate prompt
										</Text>
									</Stack>
								</Combobox.Item>
								<Combobox.Item
									className={styles.comboboxItem}
									onClick={() => setAiMode(false)}
									store={comboboxStore}
								>
									<Stack
										direction="row"
										gap="4"
										align="center"
									>
										<IconSolidX />
										<Text color="weak" size="small">
											Cancel
										</Text>
									</Stack>
								</Combobox.Item>
							</Combobox.Group>
						</Box>
					</Combobox.Popover>
				)}

				<Box display="flex" pr="8" py="6" gap="6">
					{displayTags ? (
						<DateRangePicker
							emphasis="medium"
							iconLeft={<IconSolidClock />}
							selectedValue={dateSuggestion}
							onDatesChange={() => null}
							presets={DEFAULT_TIME_PRESETS}
							minDate={moment().subtract(1, 'year').toDate()}
							disabled
						/>
					) : (
						<>
							<Button
								trackingId="cancel-ai-search"
								onClick={() => setAiMode(false)}
								kind="secondary"
								emphasis="medium"
							>
								Cancel
							</Button>
							<Button
								trackingId="generate-query-ai-search"
								onClick={() => submitQuery(aiQuery)}
								disabled={!aiQuery || aiSuggestionLoading}
								loading={aiSuggestionLoading}
							>
								Generate&nbsp;Query
							</Button>
						</>
					)}
				</Box>
			</Box>
		</Box>
	)
}
