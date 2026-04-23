import {
	Box,
	IconSolidInformationCircle,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import clsx from 'clsx'
import React from 'react'

import styles from './InfoTooltip.module.css'

export type Props = React.PropsWithChildren & {
	className?: string
	title: React.ReactNode
	size?: 'small' | 'medium' | 'large'
	hideArrow?: boolean
	onClick?: () => void
	color?: string
	placement?: any
	align?: any
}

const InfoTooltip = ({
	children,
	className,
	size = 'small',
	hideArrow = false,
	onClick,
	color,
	title,
	placement,
	align,
}: Props) => {
	if (title === undefined) {
		return null
	}

	return (
		<Tooltip
			placement={placement}
			trigger={
				children ?? (
					<Box style={{ height: 12, width: 12, display: 'inline-flex' }}>
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
				)
			}
		>
			{title}
		</Tooltip>
	)
}

export default InfoTooltip
