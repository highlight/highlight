import * as Ariakit from '@ariakit/react'
import clsx, { ClassValue } from 'clsx'
import { useState } from 'react'

import { Stack } from '../Stack/Stack'
import { Tag, Props as TagProps } from '../Tag/Tag'

type Option = string | number
type Props = {
	options: Option[]
	background?: boolean
	defaultValue?: Option
	name?: string
	size?: TagProps['size']
	onChange?: (value: Option) => void
	cssClass?: ClassValue | ClassValue[]
	disabled?: boolean
}

export const TagSwitchGroup: React.FC<Props> = ({
	background = true,
	defaultValue,
	name,
	options,
	onChange,
	cssClass,
	disabled,
}) => {
	const [selectedOption, setSelectedOption] = useState(
		defaultValue ?? options[0],
	)

	const handleClick = (option: Option) => {
		setSelectedOption(option)
		if (onChange) {
			onChange(option)
		}
	}

	return (
		<Ariakit.RadioProvider>
			<Ariakit.RadioGroup
				data-testid="radio-group"
				className={clsx(cssClass)}
			>
				<Stack
					direction="row"
					gap="4"
					p="4"
					borderRadius="8"
					backgroundColor={background ? 'elevated' : undefined}
					flexGrow={0}
					// Border radius value does not exist in sprinkles and is a one-off.
					style={{ borderRadius: 9 }}
				>
					{options.map((option, index) => {
						const selected = selectedOption === option
						return (
							<Ariakit.Radio
								key={index}
								name={name}
								value={option}
								disabled={disabled}
								render={
									<Tag
										key={option}
										kind={
											selected ? 'primary' : 'secondary'
										}
										emphasis={selected ? 'high' : 'low'}
										size="large"
										shape="basic"
										onClick={() => handleClick(option)}
										style={{
											alignItems: 'center',
											justifyContent: 'center',
											flex: 1,
											textAlign: 'center',
										}}
										data-testid="radio-option"
										type="button"
									>
										{option}
									</Tag>
								}
							/>
						)
					})}
				</Stack>
			</Ariakit.RadioGroup>
		</Ariakit.RadioProvider>
	)
}
