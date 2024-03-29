import * as Ariakit from '@ariakit/react'
import { useState } from 'react'

import { Stack } from '../Stack/Stack'
import { Props as TagProps, Tag } from '../Tag/Tag'

type Option = string | number
type Props = {
	options: Option[]
	background?: boolean
	defaultValue?: Option
	name?: string
	size?: TagProps['size']
	onChange?: (value: Option) => void
}

export const TagSwitchGroup: React.FC<Props> = ({
	background = true,
	defaultValue,
	name,
	options,
	onChange,
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
			<Ariakit.RadioGroup data-testid="radio-group">
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
											flexGrow: 1,
											textAlign: 'center',
										}}
										data-testid="radio-option"
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
