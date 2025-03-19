import {
	Box,
	IconSolidBell,
	IconSolidDocumentDownload,
	IconSolidDotsHorizontal,
	IconSolidDuplicate,
	IconSolidTrash,
	Menu,
} from '@highlight-run/ui/components'
import * as React from 'react'

type Props = {
	emphasis: 'low' | 'medium'
	onDownload?: () => void
	onCreateAlert?: () => void
	onClone?: () => void
	onDelete?: () => void
}

export const GraphMenu: React.FC<Props> = ({
	emphasis,
	onDownload,
	onCreateAlert,
	onClone,
	onDelete,
}) => {
	return (
		<Menu>
			<Menu.Button
				size="xSmall"
				emphasis={emphasis}
				kind="secondary"
				iconLeft={<IconSolidDotsHorizontal />}
			/>
			<Menu.List>
				{onDownload && (
					<Menu.Item
						onClick={(e) => {
							e.stopPropagation()
							onDownload()
						}}
					>
						<Box display="flex" alignItems="center" gap="4">
							<IconSolidDocumentDownload />
							Download CSV
						</Box>
					</Menu.Item>
				)}
				{onCreateAlert && (
					<Menu.Item
						onClick={(e) => {
							e.stopPropagation()
							onCreateAlert()
						}}
					>
						<Box display="flex" alignItems="center" gap="4">
							<IconSolidBell />
							Create alert
						</Box>
					</Menu.Item>
				)}
				{onClone && (
					<Menu.Item
						onClick={(e) => {
							e.stopPropagation()
							onClone()
						}}
					>
						<Box display="flex" alignItems="center" gap="4">
							<IconSolidDuplicate />
							Clone graph
						</Box>
					</Menu.Item>
				)}
				{onDelete && (
					<Menu.Item
						onClick={(e) => {
							e.stopPropagation()
							onDelete()
						}}
					>
						<Box display="flex" alignItems="center" gap="4">
							<IconSolidTrash />
							Delete graph
						</Box>
					</Menu.Item>
				)}
			</Menu.List>
		</Menu>
	)
}
