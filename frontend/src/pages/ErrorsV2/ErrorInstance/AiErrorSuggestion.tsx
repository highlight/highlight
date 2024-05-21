import { useApolloClient } from '@apollo/client'
import { Button } from '@components/Button'
import { toast } from '@components/Toaster'
import { GetErrorResolutionSuggestionDocument } from '@graph/hooks'
import {
	Box,
	ButtonIcon,
	IconSolidRefresh,
	IconSolidSparkles,
	IconSolidThumbDown,
	IconSolidThumbUp,
	Stack,
	Text,
} from '@highlight-run/ui/components'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'

import AiErrorSuggestionCard from '@/pages/ErrorsV2/ErrorInstance/AiErrorSuggestionCard'
import analytics from '@/util/analytics'

import * as styles from './AiErrorSuggestion.css'

type Props = {
	errorObjectId: string
}

export const AiErrorSuggestion = ({ errorObjectId }: Props) => {
	const [data, setData] = useState<any | null>(null)
	const [error, setError] = useState<unknown | null>(null)
	const client = useApolloClient()
	const [voted, setVoted] = useState(false)
	const [loading, setLoading] = useState(false)

	const getErrorResolutionRequest = async () => {
		try {
			setLoading(true)
			const response = await client.query({
				query: GetErrorResolutionSuggestionDocument,
				variables: {
					error_object_id: errorObjectId,
				},
				fetchPolicy: 'no-cache',
			})
			setError(null)
			setData(response.data)
			setLoading(false)
		} catch (e) {
			setError(e)
			setData(null)
			setLoading(false)
		}
	}

	useEffect(() => {
		setData(null)
		setError(null)
	}, [errorObjectId])

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
														toast.success(
															'Thanks for your feedback!',
															{ duration: 5000 },
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
														toast.success(
															'Thanks for your feedback!',
															{ duration: 5000 },
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
							getErrorResolutionRequest()
							setVoted(false)
						}}
						kind="primary"
						emphasis="high"
						trackingId="error-instance_get-ai-suggestion"
						loading={loading}
						iconLeft={<IconSolidSparkles />}
					>
						{loading ? 'Harold is thinking...' : 'Get error help'}
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
							getErrorResolutionRequest()
							setVoted(false)
						}}
						kind="secondary"
						emphasis="medium"
						trackingId="error-instance_refresh-ai-suggestion"
						loading={loading}
						iconLeft={<IconSolidRefresh />}
					>
						{loading
							? 'Harold is thinking...'
							: 'Refresh Suggestion'}
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
