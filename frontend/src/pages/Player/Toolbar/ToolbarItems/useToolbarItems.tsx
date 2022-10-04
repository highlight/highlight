import { ToolbarItem } from '@pages/Player/Toolbar/ToolbarItemsContext/ToolbarItemsContext'
import useLocalStorage from '@rehooks/local-storage'

const LocalStorageKeyPrefix = 'highlightToolbarItem'

const useToolbarItems = () => {
	const [devToolsButton, setDevToolsButton] = useLocalStorage<ToolbarItem>(
		`${LocalStorageKeyPrefix}-devtools`,
		{
			isPinned: true,
		},
	)
	const [timelineAnnotations, setTimelineAnnotations] =
		useLocalStorage<ToolbarItem>(
			`${LocalStorageKeyPrefix}-timeline-annotations`,
			{
				isPinned: false,
			},
		)
	const [playbackSpeedControl, setPlaybackSpeedControl] =
		useLocalStorage<ToolbarItem>(
			`${LocalStorageKeyPrefix}-playback-speed-control`,
			{
				isPinned: false,
			},
		)
	const [showMouseTrail, setShowMouseTrail] = useLocalStorage<ToolbarItem>(
		`${LocalStorageKeyPrefix}-mouse-trail`,
		{
			isPinned: false,
		},
	)
	const [skipInactive, setSkipInactive] = useLocalStorage<ToolbarItem>(
		`${LocalStorageKeyPrefix}-skip-inactive`,
		{
			isPinned: false,
		},
	)
	const [autoPlay, setAutoPlay] = useLocalStorage<ToolbarItem>(
		`${LocalStorageKeyPrefix}-autoplay`,
		{
			isPinned: false,
		},
	)
	const [showPlayerTime, setShowPlayerTime] = useLocalStorage<ToolbarItem>(
		`${LocalStorageKeyPrefix}-playerTime`,
		{
			isPinned: false,
		},
	)

	return {
		devToolsButton,
		setDevToolsButton,
		timelineAnnotations,
		setTimelineAnnotations,
		playbackSpeedControl,
		setPlaybackSpeedControl,
		showMouseTrail,
		setShowMouseTrail,
		skipInactive,
		setSkipInactive,
		autoPlay,
		setAutoPlay,
		showPlayerTime,
		setShowPlayerTime,
	}
}

export default useToolbarItems
