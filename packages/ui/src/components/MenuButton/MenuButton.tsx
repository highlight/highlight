import React from 'react'

import { Badge } from '../Badge/Badge'
import { Variants } from '../Badge/styles.css'
import { Box } from '../Box/Box'
import { IconSolidCheveronDown } from '../icons'
import { Menu } from '../Menu/Menu'
import { Text } from '../Text/Text'
import * as styles from './styles.css'

type Props = styles.Variants & {
	options: {
		key: string
		render: React.ReactNode
		variants?: Variants
	}[]
	selectedKey?: string
	onChange: (value: string) => void
	divider?: boolean
}

export const MenuButton: React.FC<Props> = ({ ...props }) => {
	const [selected, setSelected] = React.useState<string>(
		props.selectedKey ?? props.options[0].key,
	)
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
					<IconSolidCheveronDown />
				</Box>
			</Menu.Button>
			<Menu.List>
				{props.options.map((o, idx) => {
					const item = (
						<Menu.Item
							key={o.key}
							onClick={() => {
								setSelected(o.key)
								props.onChange(o.key)
							}}
						>
							{o.variants ? (
								<Box display="flex" alignItems="center">
									<Badge
										size="medium"
										label={o.render?.toString()}
										{...o.variants}
									/>
								</Box>
							) : (
								<Box paddingLeft="2">
									<Text>{o.render}</Text>
								</Box>
							)}
						</Menu.Item>
					)
					if (
						props.divider &&
						props.options.length > 2 &&
						idx === 0
					) {
						return (
							<>
								{item}
								<Menu.Divider />
							</>
						)
					}
					return item
				})}
			</Menu.List>
		</Menu>
	)
}
