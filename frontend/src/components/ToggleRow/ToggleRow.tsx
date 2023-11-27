import { Box, Stack, Text, Tooltip } from '@highlight-run/ui/components'

import Switch from '@/components/Switch/Switch'

export const ToggleRow = (
	label: string,
	info: string,
	checked: boolean,
	setState: (n: boolean) => void,
	disabled: boolean,
	tooltipContent?: string,
) => {
	const ToggleSwitch = () => (
		<Switch
			trackingId={`switch-${label}`}
			checked={checked}
			onChange={setState}
			disabled={disabled}
			size="default"
		/>
	)

	return (
		<Box
			pr="8"
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
			{tooltipContent ? (
				<Tooltip trigger={<ToggleSwitch />}>
					<Box style={{ maxWidth: 250 }} p="8">
						<Text>{tooltipContent}</Text>
					</Box>
				</Tooltip>
			) : (
				<ToggleSwitch />
			)}
		</Box>
	)
}
