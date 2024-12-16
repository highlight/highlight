import { toast } from '@components/Toaster'
import {
	Box,
	IconSolidClipboardCopy,
	IconSolidFilter,
	Text,
	Tooltip,
} from '@highlight-run/ui/components'
import { useEffect, useState } from 'react'

import { findMatchingAttributes } from '@/components/JsonViewer/utils'
import {
	BODY_KEY,
	DEFAULT_OPERATOR,
	quoteQueryValue,
} from '@/components/Search/SearchForm/utils'
import TextHighlighter from '@/components/TextHighlighter/TextHighlighter'
import {
	IconCollapsed,
	IconExpanded,
} from '@/pages/LogsPage/LogsTable/LogsTable'
import { textHighlight } from '@/pages/LogsPage/LogsTable/LogsTable.css'
import analytics from '@/util/analytics'

import * as styles from './JsonViewerObject.css'
import { parseSearch } from '@/components/Search/utils'

export type Props = {
	allExpanded: boolean
	attribute: string | object | number | null | undefined
	label: string
	query: string
	queryBaseKeys: string[]
	matchedAttributes: ReturnType<typeof findMatchingAttributes>
	setQuery?: (query: string) => void
}

export const JsonViewerObject: React.FC<Props> = ({
	allExpanded,
	attribute,
	label,
	matchedAttributes,
	query,
	queryBaseKeys,
	setQuery,
}) => {
	const [open, setOpen] = useState(false)

	if (typeof attribute === 'string') {
		try {
			attribute = JSON.parse(attribute)
		} catch {}
	}

	const queryKey = queryBaseKeys.join('.') || label
	const queryMatch = matchedAttributes[queryKey]

	useEffect(() => {
		setOpen(allExpanded)
	}, [allExpanded])

	return typeof attribute === 'object' ? (
		<Box
			cssClass={styles.line}
			onClick={(e) => {
				e.stopPropagation()
				setOpen(!open)
			}}
		>
			<AttributeLine>
				{open ? <IconExpanded /> : <IconCollapsed />}
				<Box py="6">
					<Text color="weak" family="monospace">
						{label}
					</Text>
				</Box>
			</AttributeLine>

			{open &&
				Object.entries(attribute ?? {}).map(([key, value], index) => (
					<JsonViewerObject
						key={index}
						allExpanded={allExpanded}
						attribute={value}
						label={key}
						matchedAttributes={matchedAttributes}
						query={query}
						queryBaseKeys={[...queryBaseKeys, key]}
						setQuery={setQuery}
					/>
				))}
		</Box>
	) : (
		<Box cssClass={styles.line}>
			<JsonViewerValue
				label={label}
				value={String(attribute)}
				query={query}
				queryKey={queryKey}
				queryMatch={queryMatch?.match}
				setQuery={setQuery}
			/>
		</Box>
	)
}

export const JsonViewerValue: React.FC<{
	label: string
	value: string
	query: string
	queryKey: string
	queryMatch?: string
	setQuery?: Props['setQuery']
}> = ({ label, query, queryKey, value, queryMatch, setQuery }) => {
	// replace wildcards for highlighting.
	const matchPattern = queryMatch?.replaceAll('*', '')

	return (
		<AttributeLine>
			<Box
				flexShrink={0}
				py="6"
				onClick={(e: any) => e.stopPropagation()}
			>
				<Text family="monospace" color="secondaryContentOnEnabled">
					"{label}":
				</Text>
			</Box>
			<Box
				display="flex"
				flexDirection="row"
				alignItems="center"
				gap="8"
				onClick={(e: any) => e.stopPropagation()}
			>
				<Box borderRadius="4" p="6">
					<Text family="monospace" color="caution" break="word">
						{matchPattern ? (
							<TextHighlighter
								highlightClassName={textHighlight}
								searchWords={[matchPattern]}
								textToHighlight={value}
							/>
						) : (
							<>{value ? value : '""'}</>
						)}
					</Text>
				</Box>
				<Box cssClass={styles.attributeActions}>
					{!!query && !!setQuery && (
						<Box>
							<Tooltip
								trigger={
									<IconSolidFilter
										className={styles.attributeAction}
										size="12"
										onClick={() => {
											const { queryParts } =
												parseSearch(query)
											if (!queryParts || !setQuery) {
												return
											}

											const index = queryParts.findIndex(
												(term) => term.key === queryKey,
											)

											// Build the query part text directly
											const queryValue =
												quoteQueryValue(value)
											const queryPartText =
												queryKey === BODY_KEY
													? queryValue
													: `${queryKey}${DEFAULT_OPERATOR}${queryValue}`

											let newQuery = query // Get existing query string

											if (index !== -1) {
												// Replace the existing part
												const beforeParts =
													queryParts.slice(0, index)
												const afterParts =
													queryParts.slice(index + 1)

												newQuery = [
													...beforeParts.map(
														(p) => p.text,
													),
													queryPartText,
													...afterParts.map(
														(p) => p.text,
													),
												]
													.join(' ')
													.trim()
											} else {
												// Append new part
												newQuery = newQuery
													? `${newQuery} ${queryPartText}`
													: queryPartText
											}

											setQuery(newQuery)
											analytics.track(
												'logs_apply-filter_click',
											)
										}}
									/>
								}
								delayed
							>
								<Box p="4">
									<Text userSelect="none" color="n11">
										Apply as filter
									</Text>
								</Box>
							</Tooltip>
						</Box>
					)}
					<Box>
						<Tooltip
							trigger={
								<IconSolidClipboardCopy
									className={styles.attributeAction}
									size="12"
									onClick={() => {
										navigator.clipboard.writeText(
											quoteQueryValue(value),
										)
										toast.success(
											'Value copied to your clipboard',
										)
										analytics.track(
											'json-viewer_copy-to-clipboard_click',
										)
									}}
								/>
							}
							delayed
						>
							<Box p="4">
								<Text userSelect="none" color="n11">
									Copy to your clipboard
								</Text>
							</Box>
						</Tooltip>
					</Box>
				</Box>
			</Box>
		</AttributeLine>
	)
}

const AttributeLine: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<Box
			cssClass={styles.attributeLine}
			display="flex"
			alignItems="center"
			flexDirection="row"
			gap="4"
			flexShrink={0}
		>
			{children}
		</Box>
	)
}
