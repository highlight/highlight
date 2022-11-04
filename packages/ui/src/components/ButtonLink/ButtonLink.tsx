import React from 'react'
import { Button as AriakitButton, ButtonProps } from 'ariakit/button'
import { Text } from '../Text/Text'

import * as styles from './styles.css'

type Props = React.PropsWithChildren & ButtonProps

export const ButtonLink: React.FC<Props> = ({ children, ...buttonProps }) => {
	return (
		<AriakitButton as="button" className={styles.button} {...buttonProps}>
			<Text>{children}</Text>
		</AriakitButton>
	)
}
