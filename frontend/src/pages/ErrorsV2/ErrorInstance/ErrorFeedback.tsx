import { Box, Text } from '@highlight-run/ui'

import { useGetSessionCommentsQuery } from '@/graph/generated/hooks'
import { GetErrorObjectQuery } from '@/graph/generated/operations'

type Props = {
	errorObject: GetErrorObjectQuery['error_object']
}

export const ErrorFeedback = ({ errorObject }: Props) => {
	const { data } = useGetSessionCommentsQuery({
		variables: {
			session_secure_id: errorObject?.session?.secure_id ?? '',
		},
		skip: !errorObject?.session?.secure_id,
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
				{data.session_comments.map((sessionComment) => {
					return (
						<Box key={sessionComment.id}>
							{sessionComment?.text}
						</Box>
					)
				})}
			</Box>
		</>
	)
}
