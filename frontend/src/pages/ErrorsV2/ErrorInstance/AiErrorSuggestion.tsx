import { NetworkStatus } from '@apollo/client'
import { Button } from '@components/Button'
import { useGetErrorResolutionSuggestionLazyQuery } from '@graph/hooks'
import {
	Box,
	ButtonIcon,
	IconSolidRefresh,
	IconSolidSparkles,
	IconSolidThumbDown,
	IconSolidThumbUp,
	Stack,
	Text,
} from '@highlight-run/ui'
import clsx from 'clsx'
import React from 'react'
import ReactMarkdown from 'react-markdown'

import AiErrorSuggestionCard from '@/pages/ErrorsV2/ErrorInstance/AiErrorSuggestionCard'

import * as styles from './AiErrorSuggestion.css'

type Props = {
	errorObjectId: string
}

export const AiErrorSuggestion = ({ errorObjectId }: Props) => {
	const [
		getErrorResolutionSuggestion,
		{ data, error, loading, networkStatus, refetch },
	] = useGetErrorResolutionSuggestionLazyQuery({
		notifyOnNetworkStatusChange: true,
	})

	return (
		<Box
			p="16"
			borderRadius="8"
			cssClass={clsx(styles.aiSuggestion, {
				[styles.aiSuggestionPrompt]: !data?.error_resolution_suggestion,
			})}
		>
			{data?.error_resolution_suggestion ? (
				<Stack flexDirection="column">
					<AiErrorSuggestionCard
						content={
							<ReactMarkdown
								components={{
									li: ({ children }) => <li>{children}</li>,
								}}
							>
								{data.error_resolution_suggestion}
							</ReactMarkdown>
						}
					/>
					<AiErrorSuggestionCard
						content={
							<>
								<Text>Was this helpful?</Text>
								<Box display="flex">
									<Stack
										border="secondary"
										borderRadius="8"
										align="center"
										direction="row"
										gap="0"
									>
										<Box p="1">
											<ButtonIcon
												icon={<IconSolidThumbUp />}
												kind="secondary"
												emphasis="low"
												size="small"
												onClick={() => {}}
											/>
										</Box>
										<Box
											borderLeft="secondary"
											height="full"
										></Box>
										<Box p="1">
											<ButtonIcon
												icon={<IconSolidThumbDown />}
												kind="secondary"
												emphasis="low"
												size="small"
												onClick={() => {}}
											/>
										</Box>
									</Stack>
								</Box>
							</>
						}
					/>
				</Stack>
			) : error ? (
				<>
					<Text weight="bold">Ask Harold for help!</Text>
					<Box mt="16">
						<Text>
							There was an error getting a resolution suggestion.
							Please try again.
						</Text>
					</Box>
				</>
			) : (
				<>
					<Text weight="bold">Ask Harold for help!</Text>
					<Box mt="16">
						<Text>
							Get help from Highlight's AI programming partner,
							Harold. Click the button below for a suggestion on
							how to resolve this issue. By clicking this button
							you agree to send context about this error to the
							OpenAI API.
						</Text>
					</Box>
				</>
			)}

			{!data?.error_resolution_suggestion ? (
				<Box display="flex" mt="12">
					<Button
						onClick={() => {
							getErrorResolutionSuggestion({
								variables: {
									error_object_id: errorObjectId,
								},
							})
						}}
						kind="primary"
						emphasis="high"
						trackingId="error-instance_get-ai-suggestion"
						loading={loading}
						iconLeft={<IconSolidSparkles />}
					>
						Get Suggestion
					</Button>
				</Box>
			) : (
				<Box display="flex" justifyContent="center" mt="12">
					<Button
						onClick={(_event) => refetch()}
						kind="secondary"
						emphasis="medium"
						trackingId="error-instance_refresh-ai-suggestion"
						loading={networkStatus === NetworkStatus.refetch}
						iconLeft={<IconSolidRefresh />}
					>
						Refresh Suggestion
					</Button>
				</Box>
			)}
		</Box>
	)
}
