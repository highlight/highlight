import { Button as AriakitButton, ButtonProps } from '@ariakit/react'
import clsx from 'clsx'
import React from 'react'

import { Text } from '../Text/Text'
import * as styles from './styles.css'

type Props = React.PropsWithChildren & ButtonProps & styles.Variants

export const ButtonLink: React.FC<Props> = ({
	children,
	kind,
	...buttonProps
}) => {
	return (
		<AriakitButton
			render={<button />}
			className={clsx(styles.button, styles.variants({ kind }))}
			type="button"
			{...buttonProps}
		>
			<Text>{children}</Text>
		</AriakitButton>
	)
}
