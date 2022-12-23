import React from 'react'
import { Box } from '../Box/Box'
import {
	IconExclamationTriangle,
	IconInformationCircle,
	IconX,
	IconXCircle,
} from '../icons'

import * as styles from './styles.css'
import { ButtonIcon } from '../ButtonIcon/ButtonIcon'
import { Text } from '../Text/Text'
import { vars } from '../../css/vars'

export type Props = React.PropsWithChildren &
	styles.Variants & {
		title: string
		icon?: boolean
		handleCloseClick?: () => void
	}

export const Callout: React.FC<Props> = ({
	children,
	kind = 'info',
	icon = true,
	title,
	handleCloseClick,
}) => {
	const Icon = kindIconLookup[kind]

	return (
		<Box
			border="secondary"
			borderRadius="8"
			display="flex"
			gap="8"
			p="8"
			cssClass={styles.variants({ kind })}
		>
			{icon && <Icon />}

			<Box gap="16" display="flex" flexDirection="column" width="full">
				<Box
					alignItems="flex-start"
					display="flex"
					justifyContent="space-between"
				>
					<Box mt="6">
						<Text weight="bold" size="medium">
							{title}
						</Text>
					</Box>

					<Box flexShrink={0}>
						{handleCloseClick && (
							<ButtonIcon
								kind="secondary"
								emphasis="low"
								shape="square"
								size="minimal"
								icon={<IconX size={16} />}
								onClick={handleCloseClick}
							/>
						)}
					</Box>
				</Box>
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
		<IconInformationCircle
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
		<IconExclamationTriangle
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
		<IconXCircle
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
