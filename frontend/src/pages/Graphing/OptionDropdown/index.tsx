import {
	Box,
	IconSolidCheveronDown,
	Menu,
	Stack,
	Tooltip,
} from '@highlight-run/ui/components'
import React from 'react'

import * as style from './styles.css'

export const OptionDropdown = <T extends string>({
	options,
	selection,
	setSelection,
	icons,
	labels,
	tooltips,
	disabled,
}: {
	options: T[]
	selection: T
	setSelection: (option: T) => void
	icons?: JSX.Element[]
	labels?: string[]
	tooltips?: React.ReactNode[]
	disabled?: boolean
}) => {
	const selectedIndex = options.indexOf(selection)
	const selectedIcon = icons?.at(selectedIndex)
	const selectedLabel = labels?.at(selectedIndex)
	return (
		<Menu>
			<Menu.Button
				kind="secondary"
				size="small"
				emphasis="medium"
				cssClass={style.menuButton}
				disabled={disabled}
			>
				<Box
					width="full"
					display="flex"
					alignItems="center"
					gap="4"
					justifyContent="space-between"
					cssClass={style.menuButtonInner}
				>
					<Stack direction="row" alignItems="center" gap="4">
						{selectedIcon}
						{selectedLabel ?? selection}
					</Stack>
					<IconSolidCheveronDown />
				</Box>
			</Menu.Button>
			<Menu.List cssClass={style.menuList}>
				{options.map((p, idx) => {
					let innerContent: React.ReactNode = (
						<Stack
							direction="row"
							alignItems="center"
							gap="4"
							width="full"
						>
							{icons?.at(idx)}
							{labels?.at(idx) ?? p}
						</Stack>
					)
					if (tooltips !== undefined) {
						innerContent = (
							<Tooltip placement="left" trigger={innerContent}>
								{tooltips[idx]}
							</Tooltip>
						)
					}
					return (
						<Menu.Item
							key={p}
							onClick={() => {
								setSelection(p as T)
							}}
						>
							{innerContent}
						</Menu.Item>
					)
				})}
			</Menu.List>
		</Menu>
	)
}
