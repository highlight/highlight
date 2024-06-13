import {
	Box,
	Combobox,
	DateRangePicker,
	DateRangePreset,
	DEFAULT_TIME_PRESETS,
	IconSolidCheck,
	IconSolidClock,
	IconSolidExclamation,
	IconSolidPencil,
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
import LoadingBox from '@/components/LoadingBox'
import { useSearchContext } from '@/components/Search/SearchContext'

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
		}
	}

	const getValue = () => {
		if (aiSuggestionLoading) {
			return 'Harold AI is thinking...'
		}

		if (displayError) {
			return 'Oops... Harold AI is having issues.'
		}

		if (submitted) {
			return aiSuggestion?.query
		}

		return aiQuery
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

	const displayError = !!aiSuggestionError && submitted

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
			{!!displayError ? (
				<IconSolidExclamation
					className={styles.searchIcon}
					color={vars.theme.interactive.fill.bad.enabled}
				/>
			) : (
				<IconSolidSparkles
					className={styles.searchIcon}
					color={vars.theme.interactive.fill.primary.enabled}
				/>
			)}
			<Box
				display="flex"
				alignItems="center"
				gap="6"
				width="full"
				color="weak"
				position="relative"
				margin="auto"
			>
				<Combobox
					store={comboboxStore}
					disabled={submitted}
					name="aiSearch"
					placeholder="Generate a query using AI..."
					className={clsx(styles.combobox, {
						[styles.comboboxError]: !!displayError,
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
					}}
					style={{
						paddingLeft: 40,
						top: 6,
					}}
					data-hl-record
				/>

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
												Done
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
					{aiSuggestionLoading ? (
						<LoadingBox />
					) : submitted && aiSuggestion && !aiSuggestionError ? (
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
								disabled={!aiQuery}
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
