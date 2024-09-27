import type { InkeepChatButtonProps } from '@inkeep/uikit'
import useInkeepSettings from '@/hooks/useInkeepSettings'
import { lazy, Suspense } from 'react'

const ChatButton = lazy(() =>
	import('@inkeep/uikit').then((mod) => ({ default: mod.InkeepChatButton })),
)

function InkeepChatButton() {
	const { baseSettings, aiChatSettings, searchSettings, modalSettings } =
		useInkeepSettings()

	const chatButtonProps: InkeepChatButtonProps = {
		baseSettings,
		aiChatSettings,
		searchSettings,
		modalSettings,
	}

	return (
		<Suspense>
			<ChatButton {...chatButtonProps} />
		</Suspense>
	)
}

export default InkeepChatButton
