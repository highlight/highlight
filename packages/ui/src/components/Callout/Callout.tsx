import React from 'react'

import { vars } from '../../css/vars'
import { Box } from '../Box/Box'
import { ButtonIcon } from '../ButtonIcon/ButtonIcon'
import {
	IconSolidExclamation,
	IconSolidInformationCircle,
	IconSolidX,
	IconSolidXCircle,
} from '../icons'
import { Text } from '../Text/Text'
import * as styles from './styles.css'

export type Props = React.PropsWithChildren &
	styles.Variants & {
		title?: string
		width?: number
		style?: React.CSSProperties
		handleCloseClick?: () => void
		icon?: false | React.ComponentType<{ size: number; color: string }>
	}

const BACKGROUND_COLOR_MAP = {
	error: vars.theme.static.surface.sentiment.bad,
	info: vars.theme.static.surface.sentiment.neutral,
	warning: vars.theme.static.surface.sentiment.caution,
} as const

const TEXT_COLOR_MAP = {
	error: vars.theme.static.content.sentiment.bad,
	info: vars.theme.static.content.weak,
	warning: vars.theme.static.content.sentiment.caution,
} as const

export const Callout: React.FC<Props> = ({
	children,
	kind = 'info',
	title,
	icon,
	border,
	style = {},
	width,
	handleCloseClick,
}) => {
	const Icon = icon || kindIconLookup[kind]

	return (
		<Box
			p="8"
			gap="8"
			display="flex"
			alignItems="flex-start"
			borderRadius="8"
			border="secondary"
			cssClass={styles.variants({ kind, border })}
			justifyContent="space-between"
			style={{
				...style,
				width: width || 'auto',
			}}
		>
			{icon !== false && (
				<Box
					alignItems="center"
					alignSelf="flex-start"
					borderRadius="5"
					display="flex"
					justifyContent="center"
					textAlign="center"
					style={{
						backgroundColor: BACKGROUND_COLOR_MAP[kind],
						height: 22,
						width: 22,
					}}
				>
					<Icon size={14} color={TEXT_COLOR_MAP[kind]} />
				</Box>
			)}

			<Box gap="16" display="flex" flexDirection="column" width="full">
				{title && (
					<Box display="flex" position="relative">
						<Box mt="6">
							<Text color="strong" weight="bold" size="small">
								{title}
							</Text>
						</Box>

						{handleCloseClick && (
							<Box
								flexShrink={0}
								style={{ position: 'absolute', right: '0' }}
							>
								<ButtonIcon
									kind="secondary"
									emphasis="low"
									shape="square"
									size="minimal"
									icon={<IconSolidX size={16} />}
									onClick={handleCloseClick}
								/>
							</Box>
						)}
					</Box>
				)}
				{children}
			</Box>
		</Box>
	)
}

const kindIconLookup = {
	error: IconSolidXCircle,
	info: IconSolidInformationCircle,
	warning: IconSolidExclamation,
} as const
