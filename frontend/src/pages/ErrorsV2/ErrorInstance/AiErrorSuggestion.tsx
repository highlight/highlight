import { Button } from '@components/Button'
import { useGetErrorResolutionSuggestionLazyQuery } from '@graph/hooks'
import { Badge, Box, Heading, Stack, Text } from '@highlight-run/ui'
import React from 'react'
import ReactMarkdown from 'react-markdown'

import * as styles from './AiErrorSuggestion.css'

type Props = {
	errorObjectId: string
}

export const AiErrorSuggestion = ({ errorObjectId }: Props) => {
	const [getErrorResolutionSuggestion, { data, error, loading, refetch }] =
		useGetErrorResolutionSuggestionLazyQuery({
			notifyOnNetworkStatusChange: true,
		})

	return (
		<Box p="16" borderRadius="8" cssClass={styles.aiSuggestion}>
			<Heading level="h3">
				<Stack direction="row" align="center">
					Ask Harold for help <Badge label="Beta" size="large" />
				</Stack>
			</Heading>

			<Box mt="16">
				{data?.error_resolution_suggestion ? (
					<ReactMarkdown
						components={{
							li: ({ children }) => <li>{children}</li>,
						}}
					>
						{data.error_resolution_suggestion}
					</ReactMarkdown>
				) : error ? (
					<Text>
						There was an error getting a resolution suggestion.
						Please try again.
					</Text>
				) : (
					<Text>
						Get help from Highlight's AI programming partner,
						Harold. Click the button below for a suggestion on how
						to resolve this issue. By clicking this button you agree
						to send context about this error to the OpenAI API.
					</Text>
				)}
			</Box>

			<Box display="flex" mt="12">
				{!data?.error_resolution_suggestion ? (
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
					>
						Get Suggestion
					</Button>
				) : (
					<Button
						onClick={(_event) => refetch()}
						kind="primary"
						emphasis="high"
						trackingId="error-instance_refresh-ai-suggestion"
						loading={loading}
					>
						Refresh Suggestion
					</Button>
				)}
			</Box>
		</Box>
	)
}
