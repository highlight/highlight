import { Box } from '@highlight-run/ui/components'
import { Maybe } from 'graphql/jsutils/Maybe'

import { Avatar } from '@/components/Avatar/Avatar'

export const CommentIndicator: React.FC<{
	customImage?: Maybe<string>
}> = ({ customImage }) => {
	return (
		<Box
			backgroundColor="white"
			border="divider"
			style={{
				borderRadius: 32,
				borderBottomLeftRadius: 8,
				height: 'var(--comment-indicator-width)',
				position: 'absolute',
				width: 'var(--comment-indicator-width)',
			}}
		>
			<Avatar
				customImage={customImage ?? undefined}
				size={24}
				style={{
					position: 'absolute',
					top: 3,
					left: 3,
				}}
			/>
		</Box>
	)
}
