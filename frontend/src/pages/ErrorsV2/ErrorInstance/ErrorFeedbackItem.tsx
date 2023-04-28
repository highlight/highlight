import { Box, Stack, Text } from '@highlight-run/ui'

import { Avatar } from '@/components/Avatar/Avatar'
import RelativeTime from '@/components/RelativeTime/RelativeTime'
import { Session, SessionComment } from '@/graph/generated/schemas'
import {
	getDisplayNameAndField,
	getIdentifiedUserProfileImage,
} from '@/pages/Sessions/SessionsFeedV3/MinimalSessionCard/utils/utils'

type Props = {
	sessionComment: SessionComment
	session: Partial<Session>
}

export const ErrorFeedbackItem = ({ session, sessionComment }: Props) => {
	const [displayName, _field] = getDisplayNameAndField(session)
	const avatarImage = getIdentifiedUserProfileImage(session)

	return (
		<Box display="flex" gap="10">
			<Avatar
				seed={displayName}
				style={{ height: 28, width: 28 }}
				customImage={avatarImage}
			/>
			<Stack gap="10">
				<Text color="secondaryContentText">
					<RelativeTime datetime={sessionComment.updated_at} />
				</Text>
				<Text>{sessionComment.text}</Text>
			</Stack>
		</Box>
	)
}
