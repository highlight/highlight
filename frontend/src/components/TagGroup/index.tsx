import { Box, IconProps, Tag } from '@highlight-run/ui/components'

import { Link } from '@/components/Link'

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

				const href = tag.disabled ? '' : tag.href

				return (
					<Link
						to={href}
						className={styles.tagLink}
						key={tag.key}
						// reload document to avoid removing time parameters from the URL
						reloadDocument
					>
						<Tag
							{...TAG_PROPS}
							shape={shape}
							iconLeft={tag.icon}
							disabled={tag.disabled}
						>
							{tag.label}
						</Tag>
					</Link>
				)
			})}
		</Box>
	)
}
