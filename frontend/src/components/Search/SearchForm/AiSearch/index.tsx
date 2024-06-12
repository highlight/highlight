import {
	Badge,
	Box,
	Combobox,
	IconSolidCheck,
	IconSolidExclamationCircle,
	IconSolidInformationCircle,
	IconSolidPencil,
	IconSolidRefresh,
	IconSolidSparkles,
	Stack,
	Text,
	useComboboxStore,
} from '@highlight-run/ui/components'
import React, { useRef, useState } from 'react'
import TextareaAutosize from 'react-autosize-textarea'

import { Button } from '@/components/Button'
import { useSearchContext } from '@/components/Search/SearchContext'

import * as styles from './style.css'

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
	} = useSearchContext()
	const [submitted, setSubmitted] = useState(false)
	const inputRef = useRef<HTMLTextAreaElement | null>(null)
	const comboboxStore = useComboboxStore({
		defaultValue: aiQuery ?? '',
	})

	const submitQuery = (query: string) => {
		onAiSubmit(query)
		setSubmitted(true)
	}

	const searchSubmittedQuery = () => {
		if (aiSuggestion) {
			onSubmit(aiSuggestion)
			setAiMode(false)
		}
	}

	return (
		<Box
			alignItems="stretch"
			display="flex"
			flexGrow={1}
			position="relative"
			cssClass={styles.container}
		>
			<IconSolidSparkles className={styles.searchIcon} />
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
					// disabled={submitted}
					name="aiSearch"
					placeholder="Generate a query using AI..."
					className={styles.combobox}
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
					value={submitted ? aiSuggestion : aiQuery}
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

				{submitted && (
					<Combobox.Popover
						className={styles.comboboxPopover}
						style={{
							left: 6,
						}}
						store={comboboxStore}
						gutter={10}
						sameWidth
					>
						<Box cssClass={styles.comboboxResults}>
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
							</Combobox.Group>
						</Box>
					</Combobox.Popover>
				)}

				<Box display="flex" pr="8" py="6" gap="6">
					{submitted ? (
						!!aiSuggestionError ? (
							<Badge
								variant="red"
								size="medium"
								label={aiSuggestionError.message}
								iconStart={<IconSolidExclamationCircle />}
							/>
						) : (
							<Badge
								variant="gray"
								size="medium"
								label="AI responses can be inaccurate or misleading."
								iconStart={<IconSolidInformationCircle />}
							/>
						)
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
