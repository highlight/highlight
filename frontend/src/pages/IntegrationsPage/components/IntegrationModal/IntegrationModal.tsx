import { Modal, Text } from '@highlight-run/ui/components'
import React from 'react'

interface Props {
	title: string
	visible: boolean
	width?: number
	onCancel: () => void
	configurationPage: () => React.ReactNode
}

export const IntegrationModal = ({
	title,
	width,
	configurationPage,
	onCancel,
	visible,
}: Props) => {
	return (
		<Modal open={visible} onClose={onCancel} width={width}>
			<Modal.Header>
				<Text size="xxSmall" color="n11" weight="medium">
					{title}
				</Text>
			</Modal.Header>
			<Modal.Body>{configurationPage()}</Modal.Body>
		</Modal>
	)
}
