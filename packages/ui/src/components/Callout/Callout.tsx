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
		icon?: false | (() => JSX.Element)
	}

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
			style={{
				...style,
				width: width || 'auto',
			}}
		>
			{icon !== false ? <Icon /> : null}

			<Box gap="16" display="flex" flexDirection="column" width="full">
				{title && (
					<Box
						alignItems="flex-start"
						display="flex"
						justifyContent="space-between"
					>
						<Box mt="6">
							<Text color="strong" weight="bold" size="medium">
								{title}
							</Text>
						</Box>

						{handleCloseClick && (
							<Box flexShrink={0}>
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

// These are temporary until we componentize icon badges.
const InfoIcon = () => (
	<Box
		borderRadius="5"
		style={{
			alignItems: 'center',
			backgroundColor: vars.theme.static.surface.sentiment.neutral,
			display: 'flex',
			height: 22,
			justifyContent: 'center',
			textAlign: 'center',
			width: 22,
		}}
	>
		<IconSolidInformationCircle
			size={14}
			color={vars.theme.static.content.weak}
		/>
	</Box>
)

const WarningIcon = () => (
	<Box
		borderRadius="5"
		style={{
			alignItems: 'center',
			backgroundColor: vars.theme.static.surface.sentiment.caution,
			display: 'flex',
			height: 22,
			justifyContent: 'center',
			textAlign: 'center',
			width: 22,
		}}
	>
		<IconSolidExclamation
			size={14}
			color={vars.theme.static.content.sentiment.caution}
		/>
	</Box>
)

const ErrorIcon = () => (
	<Box
		borderRadius="5"
		style={{
			alignItems: 'center',
			backgroundColor: vars.theme.static.surface.sentiment.bad,
			display: 'flex',
			height: 22,
			justifyContent: 'center',
			textAlign: 'center',
			width: 22,
		}}
	>
		<IconSolidXCircle
			size={14}
			color={vars.theme.static.content.sentiment.bad}
		/>
	</Box>
)

const kindIconLookup = {
	error: ErrorIcon,
	info: InfoIcon,
	warning: WarningIcon,
} as const
