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
import React, { useEffect, useMemo, useRef, useState } from 'react'
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

type Props = {
	placeholder: string
	panelView?: boolean
}

export const AiSearch: React.FC<Props> = ({ panelView, placeholder }) => {
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
	const [submitted, setSubmitted] = useState<boolean>(false)
	const displayError = !!aiSuggestionError && submitted
	const displayTags = !aiSuggestionLoading && !displayError && submitted

	const inputRef = useRef<HTMLTextAreaElement | null>(null)
	const comboboxStore = useComboboxStore({
		defaultValue: aiQuery,
	})

	useEffect(() => {
		if (submitted) {
			comboboxStore.setActiveId(comboboxStore.next())
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [submitted])

	const submitQuery = (query: string) => {
		onAiSubmit(query)
		setSubmitted(true)
	}

	const exitAiMode = () => {
		setAiMode(false)
		setAiQuery('')
	}

	const searchSubmittedQuery = () => {
		if (aiSuggestion) {
			onSubmit(aiSuggestion.query)
			updateSearchTime!(
				dateSuggestion.startDate,
				dateSuggestion.endDate,
				dateSuggestion.selectedPreset,
			)
			exitAiMode()
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

	const ComboboxComponent = (
		<>
			{displayTags && (
				<Box
					cssClass={styles.comboboxTagsContainer}
					style={{
						left: 2,
						paddingLeft: 36,
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
				placeholder={placeholder}
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
						exitAiMode()
					}
				}}
				style={{
					paddingLeft: 36,
				}}
				autoFocus
				data-hl-record
			/>
			{!aiSuggestionLoading && submitted && (
				<Combobox.Popover
					className={styles.comboboxPopover}
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
									onClick={searchSubmittedQuery}
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
								<Stack direction="row" gap="4" align="center">
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
								<Stack direction="row" gap="4" align="center">
									<IconSolidRefresh />
									<Text color="weak" size="small">
										Regenerate prompt
									</Text>
								</Stack>
							</Combobox.Item>
							<Combobox.Item
								className={styles.comboboxItem}
								onClick={exitAiMode}
								store={comboboxStore}
							>
								<Stack direction="row" gap="4" align="center">
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
		</>
	)

	const CancelButton = (
		<Button
			trackingId="cancel-ai-search"
			onClick={exitAiMode}
			kind="secondary"
			emphasis="medium"
		>
			Cancel
		</Button>
	)

	const GenerateButton = (
		<Button
			trackingId="generate-query-ai-search"
			onClick={() => submitQuery(aiQuery)}
			disabled={displayTags || !aiQuery || aiSuggestionLoading}
			loading={aiSuggestionLoading}
		>
			Generate&nbsp;Query
		</Button>
	)

	if (panelView) {
		return (
			<Stack alignItems="flex-start" width="full" p="8" gap="8">
				<DateRangePicker
					emphasis="high"
					iconLeft={<IconSolidClock />}
					selectedValue={dateSuggestion}
					onDatesChange={() => null}
					presets={DEFAULT_TIME_PRESETS}
					minDate={moment().subtract(1, 'year').toDate()}
					disabled
				/>
				<Stack
					alignItems="flex-end"
					display="flex"
					width="full"
					p="2"
					gap="0"
					flexGrow={1}
					cssClass={clsx(styles.container, {
						[styles.containerError]: !!displayError,
					})}
				>
					<Box
						background="white"
						borderTopLeftRadius="5"
						borderTopRightRadius="5"
						width="full"
					>
						<Icon />
						{ComboboxComponent}
					</Box>
					<Box borderBottom="dividerWeak" width="full" />
					<Stack
						flexDirection="row"
						borderBottomLeftRadius="5"
						borderBottomRightRadius="5"
						justifyContent="space-between"
						py="6"
						pl="8"
						pr="4"
						gap="4"
					>
						{CancelButton}
						{GenerateButton}
					</Stack>
				</Stack>
			</Stack>
		)
	}

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
				{ComboboxComponent}
			</Box>

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
						{CancelButton}
						{GenerateButton}
					</>
				)}
			</Box>
		</Box>
	)
}
