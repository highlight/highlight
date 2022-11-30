import React from 'react'

import * as styles from './styles.css'
import { Button } from '../Button/Button'
import { IconCaretDown } from '../icons'

type Props = styles.Variants & {
	options: string[]
	onChange: (value: string) => void
}

// TODO(vkorolik) implement
export const DropdownButton: React.FC<Props> = ({ ...props }) => {
	const [selected, setSelected] = React.useState<string>(props.options[0])
	return (
		<Button
			kind="secondary"
			className={styles.variants({ size: props.size })}
			iconRight={<IconCaretDown />}
		>
			{selected}
		</Button>
	)
}
