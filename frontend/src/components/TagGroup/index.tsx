import { Link } from '@components/Link'
import { Box, IconProps, Tag, Tooltip } from '@highlight-run/ui/components'

import * as styles from './style.css'

const TAG_PROPS = {
	size: 'medium',
	kind: 'secondary',
	emphasis: 'medium',
} as const

type TagLink = {
	key: string
	href: string
	disabled: boolean
	icon: React.ReactElement<IconProps>
	label: string
	tooltip?: string
}

type Props = {
	tagLinks: TagLink[]
}

type Shape = 'square' | 'leftBasic' | 'rightBasic'

export const TagGroup: React.FC<Props> = ({ tagLinks }) => {
	return (
		<Box>
			{tagLinks.map((tag, index) => {
				let shape: Shape = 'square'
				if (index === 0) {
					shape = 'leftBasic'
				}
				if (index === tagLinks.length - 1) {
					shape = 'rightBasic'
				}

				return (
					<TagContainer
						key={tag.key}
						disabled={tag.disabled}
						tooltip={tag.tooltip}
						href={tag.href}
					>
						<Tag
							{...TAG_PROPS}
							shape={shape}
							iconLeft={tag.icon}
							disabled={tag.disabled}
						>
							{tag.label}
						</Tag>
					</TagContainer>
				)
			})}
		</Box>
	)
}

const TagContainer: React.FC<any> = ({ children, tooltip, disabled, href }) => {
	const tagWithTooltip = tooltip ? (
		<Tooltip trigger={children}>{tooltip}</Tooltip>
	) : (
		children
	)

	if (disabled) {
		return <span className={styles.tagLink}>{tagWithTooltip}</span>
	}

	return (
		<Link
			to={href}
			className={styles.tagLink}
			// reload document to avoid removing time parameters from the URL
			reloadDocument
		>
			{tagWithTooltip}
		</Link>
	)
}
