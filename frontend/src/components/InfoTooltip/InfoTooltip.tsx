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
	placement?: 'top' | 'bottom' | 'left' | 'right'
	className?: string
	size?: 'small' | 'medium' | 'large'
	hideArrow?: boolean
	onClick?: () => void
	color?: string
}

const InfoTooltip = ({ onClick, color, title, placement }: Props) => {
	if (title == undefined) {
		return null
	}

	return (
		<Tooltip
			trigger={
				<Box style={{ height: 12, width: 12, display: 'inline-flex' }}>
					<IconSolidInformationCircle
						onClick={onClick}
						color={
							color ??
							vars.theme.interactive.fill.secondary.content.text
						}
						className={clsx(styles.icon)}
					/>
				</Box>
			}
			placement={placement}
		>
			{title}
		</Tooltip>
	)
}

export default InfoTooltip
