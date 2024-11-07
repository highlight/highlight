import type { InkeepChatButtonProps } from '@inkeep/uikit'
import useInkeepSettings from '@/hooks/useInkeepSettings'
import { Suspense } from 'react'

// TODO(vkorolik) inkeep disabled - breaking rrweb replay
// const ChatButton = lazy(() =>
// 	import('@inkeep/uikit').then((mod) => ({ default: mod.InkeepChatButton })),
// )
const ChatButton = () => null

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
