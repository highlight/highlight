import * as Ariakit from '@ariakit/react'
import { useState } from 'react'

import { Box } from '@/components/Box/Box'
import { Stack } from '@/components/Stack/Stack'

import { Props as TagProps, Tag } from '../Tag/Tag'

type Option = string | number
type Props = {
	background?: boolean
	options: Option[]
	size?: TagProps['size']
	onChange?: (value: Option) => void
}

export const TagSwitchGroup: React.FC<Props> = ({
	background = true,
	options,
	onChange,
}) => {
	const [selectedOption, setSelectedOption] = useState(options[0])

	const handleClick = (option: Option) => {
		setSelectedOption(option)
		if (onChange) {
			onChange(option)
		}
	}

	return (
		<Ariakit.RadioProvider>
			<Ariakit.RadioGroup>
				<Box>
					<Stack
						direction="row"
						gap="4"
						p="4"
						borderRadius="8"
						backgroundColor={background ? 'elevated' : undefined}
						flexGrow={0}
						style={{ borderRadius: 9 }}
					>
						{options.map((option, index) => (
							<Ariakit.Radio
								key={index}
								value={option}
								render={
									<Tag
										key={option}
										kind={
											option === selectedOption
												? 'primary'
												: 'secondary'
										}
										emphasis={
											selectedOption === option
												? 'high'
												: 'low'
										}
										size="large"
										shape="basic"
										onClick={() => handleClick(option)}
										style={{
											alignItems: 'center',
											justifyContent: 'center',
											flexGrow: 1,
											textAlign: 'center',
										}}
									>
										{option}
									</Tag>
								}
							/>
						))}
					</Stack>
				</Box>
			</Ariakit.RadioGroup>
		</Ariakit.RadioProvider>
	)
}
