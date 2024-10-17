import React, { useMemo } from 'react'
import { Box, Heading, Stack, Tag } from '@highlight-run/ui/components'

import { ProductType } from '@/graph/generated/schemas'
import { PRODUCTS_TO_ICONS } from '@/pages/Graphing/constants'

type Props = {
	alertName: string
	productType: ProductType
	disabled: boolean
}

type AlertState = {
	state: string
	color: 'secondary' | 'danger' | 'success'
}

export const AlertHeader: React.FC<Props> = ({
	alertName,
	productType,
	disabled,
}) => {
	const alertState: AlertState = useMemo(() => {
		return disabled
			? {
					state: 'Paused',
					color: 'secondary',
				}
			: {
					state: 'Enabled',
					color: 'success',
				}
	}, [disabled])

	return (
		<Stack>
			<Heading level="h2" lines="1">
				{alertName}
			</Heading>
			<Box display="flex" gap="4">
				<Tag shape="basic" lines="1" kind={alertState.color}>
					{alertState.state}
				</Tag>
				<Tag
					shape="basic"
					lines="1"
					kind="secondary"
					iconLeft={PRODUCTS_TO_ICONS[productType]}
				>
					{productType}
				</Tag>
			</Box>
		</Stack>
	)
}
