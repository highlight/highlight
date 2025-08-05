import { toast } from '@components/Toaster'
import { useProjectId } from '@hooks/useProjectId'
import { Command } from 'react-command-palette'
import { useNavigate } from 'react-router-dom'

import usePlayerConfiguration from '../../../pages/Player/PlayerHook/utils/usePlayerConfiguration'
import { onGetLinkWithTimestamp } from '../../../pages/Player/SessionShareButton/utils/utils'
import { useReplayerContext } from '@/pages/Player/ReplayerContext'

export type CommandWithoutId = Omit<Command, 'id'>

// Safe hook to use replayer context - returns null if context is not available
const useSafeReplayerContext = () => {
	try {
		return useReplayerContext()
	} catch {
		return null
	}
}

const NAVIGATION_COMMANDS = [
	{ route: 'sessions', name: 'Go to Sessions' },
	{ route: 'errors', name: 'Go to Errors' },
	{ route: 'alerts', name: 'Go to Alerts' },
	{ route: 'billing', name: 'Go to Billing' },
	{ route: 'settings', name: 'Go to Project Settings' },
	{ route: 'home', name: 'Go to Project Dashboard' },
] as const

export const useNavigationCommands = (): CommandWithoutId[] => {
	const { projectId } = useProjectId()
	const navigate = useNavigate()

	return NAVIGATION_COMMANDS.map(({ name, route }) => ({
		category: 'Navigation',
		command() {
			navigate(`/${projectId}/${route}`)
		},
		name,
	}))
}

export const usePlayerCommands = (
	isHighlightUser: boolean,
): CommandWithoutId[] => {
	const {
		autoPlayVideo,
		selectedTimelineAnnotationTypes,
		selectedTimelineAnnotationTypesUserPersisted,
		setAutoPlayVideo,
		setSelectedTimelineAnnotationTypes,
		setSelectedTimelineAnnotationTypesUserPersisted,
		setShowDevTools,
		setShowRightPanel,
		showDevTools,
		showRightPanel,
	} = usePlayerConfiguration()

	// Always call the hook, but safely handle when context is not available
	const replayerContext = useSafeReplayerContext()
	const time = replayerContext?.time ?? 0

	const PLAYER_COMMANDS = [
		{
			command: () => {
				if (selectedTimelineAnnotationTypes.includes('Comments')) {
					setSelectedTimelineAnnotationTypes(
						[...selectedTimelineAnnotationTypes].filter(
							(type) => type !== 'Comments',
						),
					)
				} else {
					setSelectedTimelineAnnotationTypes([
						...selectedTimelineAnnotationTypes,
						'Comments',
					])
				}
			},
			name: `${
				selectedTimelineAnnotationTypes.includes('Comments')
					? 'Hide'
					: 'Show'
			} comments`,
		},
		{
			command: () => {
				if (selectedTimelineAnnotationTypes.length === 0) {
					setSelectedTimelineAnnotationTypes([
						...selectedTimelineAnnotationTypesUserPersisted,
					])
				} else {
					setSelectedTimelineAnnotationTypesUserPersisted([
						...selectedTimelineAnnotationTypes,
					])
					setSelectedTimelineAnnotationTypes([])
				}
			},
			name: 'Toggle timeline annotations',
		},
		{
			command: () => {
				setShowDevTools(!showDevTools)
			},
			name: `${showDevTools ? 'Hide' : 'Show'} DevTools`,
		},
		{
			command: () => {
				setShowRightPanel(!showRightPanel)
			},
			name: `${showRightPanel ? 'Hide' : 'Show'} right panel`,
		},
		{
			command: () => {
				setAutoPlayVideo(!autoPlayVideo)
			},
			name: `${autoPlayVideo ? 'Disable' : 'Enable'} auto playing videos`,
		},
		{
			command: () => {
				const url = window.location.href
				toast.success('Copied link!')
				navigator.clipboard.writeText(url)
			},
			name: 'Copy URL',
		},
		{
			command: () => {
				const url = onGetLinkWithTimestamp(time)
				toast.success('Copied link!')
				navigator.clipboard.writeText(url.href)
			},
			name: 'Copy URL at current timestamp',
		},
	] as const

	/** These commands should only be exposed for Highlight engineering. */
	const HIGHLIGHT_COMMANDS = [
		{
			command: () => {
				setShowRightPanel(true)
				document.location.search = 'debug=1'
			},
			name: `Enable events debugging`,
		},
		{
			command: () => {
				document.location.search = 'download=1'
			},
			name: `Download events`,
		},
	] as const

	let commands

	if (isHighlightUser) {
		commands = [...PLAYER_COMMANDS, ...HIGHLIGHT_COMMANDS]
	} else {
		commands = [...PLAYER_COMMANDS]
	}

	return commands.map(({ name, command }) => ({
		category: 'Player',
		name,
		command,
	}))
}
