import { ButtonProps } from 'antd'
import React from 'react'

import Button from '../../../../components/Button/Button/Button'
import SvgChevronLeftIcon from '../../../../static/ChevronLeftIcon'
import SvgChevronRightIcon from '../../../../static/ChevronRightIcon'
import SvgSearchIcon from '../../../../static/SearchIcon'
import styles from './PanelToggleButton.module.scss'

type Props = ButtonProps & PanelToggleButtonProps

interface PanelToggleButtonProps {
	direction: 'left' | 'right'
	isOpen: boolean
}

const PanelToggleButton: React.FC<React.PropsWithChildren<Props>> = ({
	direction,
	isOpen,
	...props
}) => {
	const icon = getIcon({ direction, isOpen })

	return (
		<Button
			iconButton
			trackingId="PanelToggleButton"
			{...props}
			className={clsx(
				{
					[styles.leftClosed]: direction === 'left' && !isOpen,
					[styles.rightClosed]: direction === 'right' && !isOpen,
				},
				props.className,
			)}
		>
			{icon}
		</Button>
	)
}

export default PanelToggleButton

const getIcon = ({ direction, isOpen }: PanelToggleButtonProps) => {
	if (direction === 'left') {
		return isOpen ? (
			<SvgChevronLeftIcon />
		) : (
			<SvgSearchIcon className={styles.searchIcon} />
		)
	}

	return isOpen ? <SvgChevronRightIcon /> : <SvgChevronLeftIcon />
}
