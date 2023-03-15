import React, { useEffect } from 'react'

import * as styles from './styles.css'
import { Menu } from '../Menu/Menu'
import { Text } from '../Text/Text'
import { Box } from '../Box/Box'
import { IconSolidCheveronDown } from '../icons'
import { useMenuState } from 'ariakit'

type Props = styles.Variants & {
	options: {
		key: string
		render: React.ReactNode
	}[]
	onChange: (value: ReturnType<typeof useMenuState>['values']) => void
	divider?: boolean
}

export const MenuButton: React.FC<Props> = ({ ...props }) => {
	const menuState = useMenuState()
	const selectedItems = Object.keys(menuState.values).filter(
		(k) => menuState.values[k],
	)

	useEffect(() => {
		props.onChange(menuState.values)
	}, [menuState.values])

	return (
		<Menu state={menuState}>
			<Menu.Button
				size={props.size}
				kind="secondary"
				emphasis="low"
				className={styles.variants({ size: props.size })}
			>
				<Box display={'flex'} alignItems={'center'}>
					<Text case="capital">
						{selectedItems.length === 0 && 'All'}
						{selectedItems.length === 1 && selectedItems[0]}
						{selectedItems.length > 1 &&
							`${selectedItems.length} filters`}
					</Text>
					<IconSolidCheveronDown />
				</Box>
			</Menu.Button>
			<Menu.List>
				{props.options.map((o, idx) => {
					const isSelected = !!menuState.values[o.key]
					const item = (
						<Menu.ItemCheckbox name={o.key} key={o.key}>
							<input type="checkbox" checked={isSelected} />
							<Box paddingLeft="2">
								<Text>{o.render}</Text>
							</Box>
						</Menu.ItemCheckbox>
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
