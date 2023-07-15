import { ApolloError } from '@apollo/client'
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
import { message } from 'antd'
import clsx from 'clsx'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

import { GetErrorResolutionSuggestionQuery } from '@/graph/generated/operations'
import AiErrorSuggestionCard from '@/pages/ErrorsV2/ErrorInstance/AiErrorSuggestionCard'
import analytics from '@/util/analytics'

import * as styles from './AiErrorSuggestion.css'

type Props = {
	errorObjectId: string
}

export const AiErrorSuggestion = ({ errorObjectId }: Props) => {
	const [data, setData] = useState<GetErrorResolutionSuggestionQuery | null>(
		null,
	)
	const [error, setError] = useState<ApolloError | null>(null)
	const [getErrorResolutionSuggestion, { loading, refetch }] =
		useGetErrorResolutionSuggestionLazyQuery({
			notifyOnNetworkStatusChange: true,
			onCompleted: (data) => {
				setError(null)
				setData(data)
			},
			onError: (error) => {
				setError(error)
				setData(null)
			},
		})
	const [voted, setVoted] = useState(false)

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
												onClick={() => {
													if (!voted) {
														analytics.track(
															'AiErrorSuggestionFeedback',
															{
																error_object_id:
																	errorObjectId,
																vote: 1,
															},
														)
														console.log(
															`[Highlight] AiErrorSuggestionFeedback (${errorObjectId})`,
															1,
														)
														setVoted(true)
														message.success(
															`Thanks for your feedback!`,
															5,
														)
													}
												}}
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
												onClick={() => {
													if (!voted) {
														analytics.track(
															'AiErrorSuggestionFeedback',
															{
																error_object_id:
																	errorObjectId,
																vote: 0,
															},
														)
														console.log(
															`[Highlight] AiErrorSuggestionFeedback (${errorObjectId})`,
															0,
														)
														setVoted(true)
														message.success(
															`Thanks for your feedback!`,
															5,
														)
													}
												}}
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
				<Box display="flex" mt="12" gap="4">
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
						Get error help
					</Button>
					<Button
						kind="secondary"
						emphasis="low"
						trackingId="error-instance_ai-learn-more"
						onClick={() => {
							window.open(
								'https://highlight.io/blog/introducing-harold',
								'_blank',
							)
						}}
					>
						Learn more
					</Button>
				</Box>
			) : (
				<Box display="flex" justifyContent="center" mt="12" gap="4">
					<Button
						onClick={(_event) => {
							refetch()
							setVoted(false)
						}}
						kind="secondary"
						emphasis="medium"
						trackingId="error-instance_refresh-ai-suggestion"
						loading={loading}
						iconLeft={<IconSolidRefresh />}
					>
						Refresh Suggestion
					</Button>
					<Button
						kind="secondary"
						emphasis="low"
						trackingId="error-instance_ai-learn-more"
						onClick={() => {
							window.open(
								'https://highlight.io/blog/introducing-harold',
								'_blank',
							)
						}}
					>
						Learn more
					</Button>
				</Box>
			)}
		</Box>
	)
}
