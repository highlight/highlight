import {
	Box,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	Tag,
} from '@highlight-run/ui/components'

import { Link } from '@/components/Link'

import * as styles from './style.css'

const TAG_PROPS = {
	size: 'medium',
	kind: 'secondary',
	emphasis: 'medium',
} as const

type Props = {
	traceId?: string
	secureSessionId?: string
	disableErrors: boolean
}

export const RelatedResourceButtons: React.FC<Props> = ({
	traceId,
	secureSessionId,
	disableErrors,
}) => {
	const errorLinkDisabled = !traceId || disableErrors
	const sessionLinkDisabled = !traceId || !secureSessionId
	const logsLinkDisabled = !traceId

	return (
		<Box>
			<Link
				to={errorLinkDisabled ? '' : '/errors'}
				className={styles.tagLink}
			>
				<Tag
					{...TAG_PROPS}
					shape="leftBasic"
					iconLeft={<IconSolidLightningBolt />}
					disabled={errorLinkDisabled}
				>
					View errors
				</Tag>
			</Link>
			<Link
				to={sessionLinkDisabled ? '' : `/sessions/${secureSessionId}`}
				className={styles.tagLink}
			>
				<Tag
					{...TAG_PROPS}
					shape="square"
					iconLeft={<IconSolidPlayCircle />}
					disabled={!traceId || !secureSessionId}
				>
					View session
				</Tag>
			</Link>
			<Link
				to={logsLinkDisabled ? '' : '/logs'}
				className={styles.tagLink}
			>
				<Tag
					{...TAG_PROPS}
					shape="rightBasic"
					iconLeft={<IconSolidLogs />}
					disabled={!traceId}
				>
					View logs
				</Tag>
			</Link>
		</Box>
	)
}
