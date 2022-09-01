import useLocalStorage from '@rehooks/local-storage'

export const useEventTypeFilters = () => {
	const [showIdentify, setShowIdentify] = useLocalStorage(
		`highlight-show-identify`,
		true,
	)
	const [showTrack, setShowTrack] = useLocalStorage(
		`highlight-show-track`,
		true,
	)
	const [showViewport, setShowViewport] = useLocalStorage(
		`highlight-show-viewport`,
		true,
	)
	const [showSegment, setShowSegment] = useLocalStorage(
		`highlight-show-segment`,
		true,
	)
	const [showFocus, setShowFocus] = useLocalStorage(
		`highlight-show-focus`,
		true,
	)
	const [showNavigate, setShowNavigate] = useLocalStorage(
		`highlight-show-navigate`,
		true,
	)
	const [showReferrer, setShowReferrer] = useLocalStorage(
		`highlight-show-referrer`,
		true,
	)
	const [showClick, setShowClick] = useLocalStorage(
		`highlight-show-click`,
		true,
	)
	const [showReload, setShowReload] = useLocalStorage(
		`highlight-show-reload`,
		true,
	)
	const [showWebVitals, setShowWebVitals] = useLocalStorage(
		`highlight-show-web-vitals`,
		true,
	)
	const [showTabHidden, setShowTabHidden] = useLocalStorage(
		`highlight-show-tab-hidden`,
		true,
	)

	return {
		showIdentify,
		setShowIdentify,
		showTrack,
		setShowTrack,
		showViewport,
		setShowViewport,
		showSegment,
		setShowSegment,
		showFocus,
		setShowFocus,
		showNavigate,
		setShowNavigate,
		showReferrer,
		setShowReferrer,
		showClick,
		setShowClick,
		showReload,
		setShowReload,
		showWebVitals,
		setShowWebVitals,
		showTabHidden,
		setShowTabHidden,
	}
}
