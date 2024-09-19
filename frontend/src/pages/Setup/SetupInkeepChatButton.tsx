import dynamic from 'next/dynamic'
import { InkeepChatButtonProps } from '@inkeep/uikit'
import useInkeepSettings from '@/hooks/useInkeepSettings'

const ChatButton = dynamic(
	() => import('@inkeep/uikit').then((mod) => mod.InkeepChatButton),
	{
		ssr: false,
	},
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

	return <ChatButton {...chatButtonProps} />
}

export default InkeepChatButton
