import * as styles from './styles.css'

import {
	IconSolidExclamation,
	IconSolidInformationCircle,
	IconSolidX,
	IconSolidXCircle,
} from '../icons'

import { Box } from '../Box/Box'
import { ButtonIcon } from '../ButtonIcon/ButtonIcon'
import React from 'react'
import { Text } from '../Text/Text'
import { vars } from '../../css/vars'

export type Props = React.PropsWithChildren &
	styles.Variants & {
		title?: string
		icon?: false | (() => JSX.Element)
		width?: number
		handleCloseClick?: () => void
	}

export const Callout: React.FC<Props> = ({
	children,
	kind = 'info',
	title,
	icon,
	border,
	width,
	handleCloseClick,
}) => {
	const Icon = icon || kindIconLookup[kind]

	return (
		<Box
			border="secondary"
			borderRadius="8"
			display="flex"
			gap="8"
			p="8"
			cssClass={styles.variants({ kind, border })}
			style={{
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
