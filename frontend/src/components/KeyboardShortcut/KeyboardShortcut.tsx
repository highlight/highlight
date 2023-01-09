import { Badge, Stack, Text } from '@highlight-run/ui'
import React from 'react'

type Props = React.PropsWithChildren<{
	label: string
	shortcut: string | string[]
}>

export const KeyboardShortcut: React.FC<Props> = ({ label, shortcut }) => {
	return (
		<Stack direction="row" gap="4" align="center">
			<Text userSelect="none" color="n11">
				{label}
			</Text>
			{Array.isArray(shortcut) ? (
				shortcut.map((s, i) => (
					<Badge key={i} variant="grey" size="tiny" label={s} />
				))
			) : (
				<Badge variant="grey" size="tiny" label={shortcut} />
			)}
		</Stack>
	)
}
