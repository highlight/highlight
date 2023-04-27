import { Box, Text } from '@highlight-run/ui'

import { useGetSessionCommentsQuery } from '@/graph/generated/hooks'
import { Session } from '@/graph/generated/schemas'
import { ErrorFeedbackItem } from '@/pages/ErrorsV2/ErrorInstance/ErrorFeedbackItem'

type Props = {
	session: Partial<Session>
}

export const ErrorFeedback = ({ session }: Props) => {
	const { data } = useGetSessionCommentsQuery({
		variables: {
			session_secure_id: session.secure_id!,
		},
	})

	if (!data?.session_comments || data.session_comments.length === 0) {
		return null
	}

	return (
		<>
			<Box bb="secondary" pb="20" my="12">
				<Text weight="bold" size="large">
					Feedback
				</Text>
			</Box>
			<Box>
				{data.session_comments.map((sessionComment) => (
					<ErrorFeedbackItem
						key={sessionComment.id}
						errorObject={errorObject}
						sessionComment={sessionComment}
					/>
				))}
			</Box>
		</>
	)
}
