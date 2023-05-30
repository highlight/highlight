import { Box, Stack, Text } from '@highlight-run/ui'

import Switch from '@/components/Switch/Switch'

export const ToggleRow = (
	label: string,
	info: string,
	checked: boolean,
	setState: (n: boolean) => void,
	disabled: boolean,
) => {
	return (
		<Box
			pr="4"
			display="flex"
			gap="12"
			justifyContent="space-between"
			alignItems="center"
			key={label}
		>
			<Stack gap="12" direction="column" my="6">
				<Text weight="bold" size="small" color="strong">
					{label}
				</Text>
				{info && <Text color="moderate">{info}</Text>}
			</Stack>
			<Switch
				trackingId={`switch-${label}`}
				checked={checked}
				onChange={setState}
				disabled={disabled}
				size="default"
			/>
		</Box>
	)
}
