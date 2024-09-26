import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { InkeepCustomTriggerProps } from '@inkeep/uikit'
import useInkeepSettings from '@/hooks/useInkeepSettings'
import { Box, IconSolidChat, Menu } from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'

const CustomTrigger = dynamic(
	() => import('@inkeep/uikit').then((mod) => mod.InkeepCustomTrigger),
	{
		ssr: false,
	},
)

function InkeepChatSupportMenuItem() {
	const [isOpen, setIsOpen] = useState(false)
	const { baseSettings, aiChatSettings, searchSettings, modalSettings } =
		useInkeepSettings()

	const handleClose = useCallback(() => {
		console.log('Modal closed')
		setIsOpen(false)
	}, [])

	const customTriggerProps: InkeepCustomTriggerProps = {
		isOpen,
		onClose: handleClose,
		baseSettings,
		aiChatSettings,
		searchSettings,
		modalSettings,
	}

	return (
		<Menu.Item onClick={() => setIsOpen(true)}>
			<Box display="flex" alignItems="center" gap="4">
				<IconSolidChat
					size={14}
					color={vars.theme.interactive.fill.secondary.content.text}
				/>
				Chat / Support
			</Box>
			<CustomTrigger {...customTriggerProps} />
		</Menu.Item>
	)
}

export default InkeepChatSupportMenuItem
