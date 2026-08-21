import { Box, IconSolidInformationCircle, Tooltip } from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import clsx from 'clsx'

import styles from './InfoTooltip.module.css'

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

type Props = {
	title?: React.ReactNode
	placement?: TooltipPlacement
	className?: string
	align?: object
	visible?: boolean
	size?: 'small' | 'medium' | 'large'
	hideArrow?: boolean
	onClick?: () => void
	color?: string
}

const InfoTooltip = ({
	size = 'small',
	hideArrow = false,
	onClick,
	color,
	...props
}: Props) => {
	if (props.title == undefined) {
		return null
	}

	return (
		<Tooltip
			{...props}
			overlayClassName={clsx(styles.tooltip, {
				[styles.hideArrow]: hideArrow,
			})}
			mouseEnterDelay={0}
		>
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
		</Tooltip>
	)
}

export default InfoTooltip
