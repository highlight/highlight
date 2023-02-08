import { Button as AntDesignButton, ButtonProps } from 'antd'
import React from 'react'

import styles from './PillButton.module.scss'

const PillButton = ({
	children,
	...props
}: React.PropsWithChildren<ButtonProps>) => {
	return (
		<AntDesignButton
			{...props}
			className={clsx(props.className, styles.buttonBase)}
		>
			{children}
		</AntDesignButton>
	)
}

export default PillButton
