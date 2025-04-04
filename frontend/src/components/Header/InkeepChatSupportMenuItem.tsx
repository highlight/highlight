import { lazy, Suspense, useCallback, useState } from 'react'
import type { InkeepModalSearchAndChatProps } from '@inkeep/cxkit-react'
import useInkeepSettings from '@/hooks/useInkeepSettings'
import { Box, IconSolidChat, Menu } from '@highlight-run/ui/components'
import { vars } from '@highlight-run/ui/vars'

const CustomTrigger = lazy(() =>
	import('@inkeep/cxkit-react').then((mod) => ({
		default: mod.InkeepModalSearchAndChat,
	})),
)

function InkeepChatSupportMenuItem() {
	const [isOpen, setIsOpen] = useState(false)
	const { baseSettings, aiChatSettings, searchSettings, modalSettings } =
		useInkeepSettings()

	const onOpenChange = useCallback(setIsOpen, [setIsOpen])

	const customTriggerProps: InkeepModalSearchAndChatProps = {
		baseSettings,
		aiChatSettings,
		searchSettings,
		modalSettings: {
			isOpen,
			onOpenChange,
			...modalSettings,
		},
	}

	return (
		<Suspense>
			<Menu.Item onClick={() => setIsOpen(true)}>
				<Box display="flex" alignItems="center" gap="4">
					<IconSolidChat
						size={14}
						color={
							vars.theme.interactive.fill.secondary.content.text
						}
					/>
					Chat / Support
				</Box>
				<CustomTrigger {...customTriggerProps} />
			</Menu.Item>
		</Suspense>
	)
}

export default InkeepChatSupportMenuItem
