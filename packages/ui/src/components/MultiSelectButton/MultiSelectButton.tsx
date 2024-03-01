import * as Ariakit from '@ariakit/react'
import React from 'react'

import { Box } from '../Box/Box'
import { IconSolidCheckCircle, IconSolidMinus } from '../icons'
import { Text } from '../Text/Text'
import * as styles from './styles.css'

type Option = {
	key: string
	render: React.ReactNode
	clearsOnClick?: boolean
}

type Props = {
	label: string
	icon?: React.ReactNode
	defaultValue?: string
	value: string[]
	valueRender: () => React.ReactNode
	options: Option[]
	onChange: (value: string[]) => void
}

export const MultiSelectButton: React.FC<Props> = ({
	label,
	icon,
	defaultValue,
	value,
	valueRender,
	options,
	onChange,
}) => {
	const selectStore = Ariakit.useSelectStore({
		defaultValue: defaultValue ? [defaultValue] : [],
		value: value,
		setValue: (value: string[]) => onChange(value),
	})

	return (
		<Box>
			<Ariakit.SelectLabel
				store={selectStore}
				className={styles.selectLabel}
			>
				{label}
			</Ariakit.SelectLabel>
			<Ariakit.Select store={selectStore} className={styles.selectButton}>
				<>
					{icon}
					<Text size="xSmall" color="secondaryContentText">
						{valueRender()}
					</Text>
				</>
			</Ariakit.Select>
			<Ariakit.SelectPopover
				store={selectStore}
				gutter={4}
				className={styles.selectPopover}
			>
				{/*
				There is a bug in v0.2.17 of Ariakit where you need to have this arrow
				rendered or else positioning of the popover breaks. We render it, but
				hide it by setting size={0}. This is an issue with anything using a
				popover coming from the floating-ui library.
				*/}
				<Ariakit.PopoverArrow size={0} />

				{options.map((option: Option) => (
					<Ariakit.SelectItem
						key={option.key}
						value={option.key}
						className={styles.selectItem}
					>
						<div className={styles.checkbox}>
							{option.clearsOnClick &&
							!value.includes(option.key) ? (
								<IconSolidMinus color="grey" />
							) : (
								<IconSolidCheckCircle color="white" />
							)}
						</div>
						{option.render}
					</Ariakit.SelectItem>
				))}
			</Ariakit.SelectPopover>
		</Box>
	)
}
