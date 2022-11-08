import React from 'react'
import { IconProps } from '../icons'
import { Checkbox, CheckboxProps, useCheckboxState } from 'ariakit/checkbox'

import * as styles from './styles.css'

export type SwitchChangeEventHandler = (
	checked: boolean,
	event: React.MouseEvent<HTMLButtonElement>,
) => void

type Props = CheckboxProps & {
	icon: React.ReactElement<IconProps>
}

export const SwitchButton: React.FC<Props> = ({
	icon,
	onChange,
	checked,
	...rest
}) => {
	const className = styles.variants({
		variant: checked ? 'checked' : 'unchecked',
	})
	const checkbox = useCheckboxState()
	return (
		<Checkbox
			as="button"
			className={className}
			state={checkbox}
			onChange={onChange}
			checked={checked}
			{...rest}
		>
			{icon}
		</Checkbox>
	)
}
