import { Tooltip } from 'antd'
import { TooltipPropsWithTitle } from 'antd/lib/tooltip'
import classNames from 'classnames'
import React from 'react'

import SvgInformationIcon from '../../static/InformationIcon'
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
			<SvgInformationIcon
				onClick={onClick}
				className={classNames(styles.icon, {
					[styles.medium]: size === 'medium',
					[styles.large]: size === 'large',
				})}
			/>
		</Tooltip>
	)
}

export default InfoTooltip
