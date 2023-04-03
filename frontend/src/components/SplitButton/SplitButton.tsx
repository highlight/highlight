import SvgDotsHorizontalIcon from '@icons/DotsHorizontalIcon'
import analytics from '@util/analytics'
import Dropdown, { DropdownButtonProps } from 'antd/es/dropdown'
import React from 'react'

import styles from './SplitButton.module.scss'

type Props = {
	buttonLabel: string | React.ReactNode
	trackingId: string
} & Pick<DropdownButtonProps, 'onClick' | 'overlay'>

const SplitButton = ({ buttonLabel, trackingId, ...props }: Props) => {
	return (
		<Dropdown.Button
			trigger={['click']}
			type="primary"
			icon={<SvgDotsHorizontalIcon />}
			className={styles.splitButton}
			{...props}
			onClick={(e) => {
				analytics.track(`SplitButton-${trackingId}`)
				if (props.onClick) {
					props.onClick(e)
				}
			}}
		>
			{buttonLabel}
		</Dropdown.Button>
	)
}

export default SplitButton
