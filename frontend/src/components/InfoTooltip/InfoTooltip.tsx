import { Box, IconSolidInformationCircle, vars } from '@highlight-run/ui'
import { Tooltip } from 'antd'
import { TooltipPropsWithTitle } from 'antd/lib/tooltip'
import classNames from 'classnames'
import React from 'react'

import styles from './InfoTooltip.module.scss'

type Props = Pick<
	TooltipPropsWithTitle,
	'title' | 'placement' | 'className' | 'align' | 'visible'
> & {
	size?: 'small' | 'medium' | 'large'
	hideArrow?: boolean
	onClick?: () => void
}

const InfoTooltip = ({
	size = 'small',
	hideArrow = false,
	onClick,
	...props
}: Props) => {
	if (props.title == undefined) {
		return null
	}

	return (
		<Tooltip
			{...props}
			overlayClassName={classNames(styles.tooltip, {
				[styles.hideArrow]: hideArrow,
			})}
			mouseEnterDelay={0}
		>
			<Box style={{ height: 12, width: 12, display: 'flex' }}>
				<IconSolidInformationCircle
					onClick={onClick}
					color={vars.theme.interactive.fill.secondary.content.text}
					className={classNames(styles.icon, {
						[styles.medium]: size === 'medium',
						[styles.large]: size === 'large',
					})}
				/>
			</Box>
		</Tooltip>
	)
}

export default InfoTooltip
