import {
	Box,
	IconSolidInformationCircle,
	Label,
	Tooltip,
} from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'
import React, { PropsWithChildren } from 'react'

import Switch from '@/components/Switch/Switch'

import { GRAPHING_FIELD_DOCS_LINK } from '../constants'

const InfoTooltip = ({ text }: { text: string }) => {
	return (
		<Tooltip
			trigger={
				<IconSolidInformationCircle
					color={
						vars.theme.interactive.fill.secondary.content.onDisabled
					}
					size={13}
				/>
			}
		>
			{text}{' '}
			<a href={GRAPHING_FIELD_DOCS_LINK} target="_blank" rel="noreferrer">
				Read more
			</a>
		</Tooltip>
	)
}

type Props = PropsWithChildren<{
	label: string
	name: string
	enabled?: boolean
	setEnabled?: (value: boolean) => void
	disabled?: boolean
	tooltip?: string
}>

export const LabeledRow: React.FC<Props> = ({
	label,
	name,
	enabled,
	setEnabled,
	disabled,
	children,
	tooltip,
}) => {
	return (
		<Box width="full" display="flex" flexDirection="column" gap="4">
			<Box display="flex" flexDirection="row" gap="6">
				<Label label={label} name={name} />
				{tooltip !== undefined && <InfoTooltip text={tooltip} />}
				{setEnabled !== undefined && (
					<Switch
						trackingId={`${label}-switch`}
						size="small"
						disabled={disabled}
						checked={enabled}
						onChange={(enabled) => {
							setEnabled(enabled)
						}}
					/>
				)}
			</Box>
			{enabled !== false ? (
				<Box display="flex" flexDirection="row" gap="4">
					{children}
				</Box>
			) : null}
		</Box>
	)
}
