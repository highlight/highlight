import SvgDotsHorizontalIcon from '@icons/DotsHorizontalIcon'
import Dropdown, { DropdownButtonProps } from 'antd/lib/dropdown'
import { H } from 'highlight.run'
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
				H.track(`SplitButton-${trackingId}`)
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
