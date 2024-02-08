import {
	Box,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	Tag,
} from '@highlight-run/ui/components'

import * as styles from './style.css'

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
				className={styles.tagButton}
			>
				View errors
			</Tag>
			<Tag
				{...TAG_PROPS}
				shape="square"
				iconLeft={<IconSolidPlayCircle />}
				className={styles.tagButton}
			>
				View session
			</Tag>
			<Tag
				{...TAG_PROPS}
				shape="rightBasic"
				iconLeft={<IconSolidLogs />}
				className={styles.tagButton}
			>
				View logs
			</Tag>
		</Box>
	)
}
