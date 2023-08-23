import { Box, Stack, Text } from '@highlight-run/ui'
import { Header } from '@pages/Setup/Header'
import * as React from 'react'

export const TeamSetup: React.FC = () => {
	return (
		<Box>
			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<Header title="yo" subtitle="subtitle" />

				<Box
					alignItems="center"
					backgroundColor="raised"
					btr="6"
					bbr="6"
					display="flex"
					flexGrow={1}
					justifyContent="space-between"
					py="12"
					px="16"
				>
					<Stack align="center" direction="row" gap="10">
						<Box
							alignItems="center"
							backgroundColor="white"
							borderRadius="5"
							display="flex"
							justifyContent="center"
							style={{ height: 28, width: 28 }}
						>
							<img
								alt="name"
								src="imageUrl"
								style={{ height: 20, width: 20 }}
							/>
						</Box>
						<Text color="default" weight="bold">
							name
						</Text>
					</Stack>
				</Box>
			</Box>
		</Box>
	)
}
