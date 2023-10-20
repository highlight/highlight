import { Box, Stack, Text } from '@highlight-run/ui'

import RelativeTime from '@/components/RelativeTime/RelativeTime'
import { useGetSessionCommentsQuery } from '@/graph/generated/hooks'
import { Session } from '@/graph/generated/schemas'

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
		<Stack bt="secondary" py="8" px="12">
			{data.session_comments.map((sessionComment) => (
				<>
					<Stack direction="row" gap="4">
						<Text color="weak">Feedback</Text>
						<Text color="secondaryContentOnDisabled">
							<RelativeTime
								datetime={sessionComment.updated_at}
							/>
						</Text>
					</Stack>
					<Box>
						<Text key={sessionComment.id}>
							{sessionComment.text}
						</Text>
					</Box>
				</>
			))}
		</Stack>
	)
}
