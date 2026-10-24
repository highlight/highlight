import {
	Box,
	IconSolidInformationCircle,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import clsx from 'clsx'

import styles from './InfoTooltip.module.css'

type Props = {
	title?: React.ReactNode
	/** @deprecated Use `title` instead */
	text?: React.ReactNode
	className?: string
	size?: 'small' | 'medium' | 'large'
	hideArrow?: boolean
	onClick?: () => void
	color?: string
	/** @deprecated antd-specific prop, no longer used */
	placement?: string
	/** @deprecated antd-specific prop, no longer used */
	align?: unknown
	/** @deprecated antd-specific prop, no longer used */
	visible?: boolean
}

const InfoTooltip = ({
	size = 'small',
	onClick,
	color,
	title,
	text,
	className,
}: Props) => {
	const tooltipContent = title ?? text
	if (tooltipContent == undefined) {
		return null
	}

	return (
		<Tooltip
			trigger={
				<Box
					style={{ height: 12, width: 12, display: 'inline-flex' }}
					cssClass={className}
				>
					<IconSolidInformationCircle
						onClick={onClick}
						color={
							color ??
							vars.theme.interactive.fill.secondary.content.text
						}
						className={clsx(styles.icon, {
							[styles.medium]: size === 'medium',
							[styles.large]: size === 'large',
						})}
					/>
				</Box>
			}
		>
			{tooltipContent}
		</Tooltip>
	)
}

export default InfoTooltip
