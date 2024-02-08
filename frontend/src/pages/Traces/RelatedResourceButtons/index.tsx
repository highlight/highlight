import {
	Box,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	Tag,
} from '@highlight-run/ui/components'

const TAG_PROPS = {
	size: 'medium',
	kind: 'secondary',
	emphasis: 'medium',
} as const

export const RelatedResourceButtons: React.FC = () => {
	return (
		<Box>
			<Tag
				{...TAG_PROPS}
				shape="leftBasic"
				iconLeft={<IconSolidLightningBolt />}
			>
				View errors
			</Tag>
			<Tag
				{...TAG_PROPS}
				shape="square"
				iconLeft={<IconSolidPlayCircle />}
			>
				View session
			</Tag>
			<Tag {...TAG_PROPS} shape="rightBasic" iconLeft={<IconSolidLogs />}>
				View logs
			</Tag>
		</Box>
	)
}
