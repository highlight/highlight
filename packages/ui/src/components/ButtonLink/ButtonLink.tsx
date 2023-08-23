import React from 'react'
import { Button as AriakitButton, ButtonProps } from '@ariakit/react'
import { Text } from '../Text/Text'

import * as styles from './styles.css'
import clsx from 'clsx'

type Props = React.PropsWithChildren & ButtonProps & styles.Variants

export const ButtonLink: React.FC<Props> = ({
	children,
	kind,
	...buttonProps
}) => {
	return (
		<AriakitButton
			as="button"
			className={clsx(styles.button, styles.variants({ kind }))}
			{...buttonProps}
		>
			<Text>{children}</Text>
		</AriakitButton>
	)
}
