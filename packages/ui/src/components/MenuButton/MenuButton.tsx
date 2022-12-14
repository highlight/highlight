import React from 'react'

import * as styles from './styles.css'
import { IconCaretDown } from '../icons'
import { Menu } from '../Menu/Menu'
import { Text } from '../Text/Text'
import { Box } from '../Box/Box'

type Props = styles.Variants & {
	options: { key: string; render: React.ReactNode }[]
	onChange: (value: string) => void
}

export const MenuButton: React.FC<Props> = ({ ...props }) => {
	const [selected, setSelected] = React.useState<string>(props.options[0].key)
	return (
		<Menu>
			<Menu.Button
				size={props.size}
				kind="secondary"
				emphasis="low"
				className={styles.variants({ size: props.size })}
			>
				<Box display={'flex'} alignItems={'center'}>
					<Text case="capital">{selected}</Text>
					<IconCaretDown />
				</Box>
			</Menu.Button>
			<Menu.List>
				{props.options.map((o) => (
					<Menu.Item
						key={o.key}
						onClick={() => {
							setSelected(o.key)
							props.onChange(o.key)
						}}
					>
						{o.render}
					</Menu.Item>
				))}
			</Menu.List>
		</Menu>
	)
}
