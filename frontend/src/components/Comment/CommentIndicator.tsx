import { Box } from '@highlight-run/ui/components'
import { Maybe } from 'graphql/jsutils/Maybe'

import { Avatar } from '@/components/Avatar/Avatar'

export const CommentIndicator: React.FC<{
	seed: string
	customImage?: Maybe<string>
}> = ({ customImage, seed }) => {
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
				shape="circle"
				seed={seed}
				customImage={customImage ?? undefined}
				style={{
					height: 24,
					width: 24,
					position: 'absolute',
					top: 3,
					left: 3,
				}}
			/>
		</Box>
	)
}
