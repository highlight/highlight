'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface YouTubePlayerProps {
	videoId: string
	onProgress?: (progress: number) => void
}

declare global {
	interface Window {
		YT: typeof YT
		onYouTubeIframeAPIReady: () => void
	}
}

export default function YouTubePlayer({
	videoId,
	onProgress,
}: YouTubePlayerProps) {
	const [player, setPlayer] = useState<YT.Player | null>(null)
	const [isAPIReady, setIsAPIReady] = useState(false)
	const clearProgressInterval = useRef<() => void>()

	// Load the YouTube API
	useEffect(() => {
		if (typeof window === 'undefined') return

		// Save the existing callback if any
		const existingCallback = window.onYouTubeIframeAPIReady

		const tag = document.createElement('script')
		tag.src = 'https://www.youtube.com/iframe_api'
		tag.async = true
		document.body.appendChild(tag)

		// Set up our callback
		window.onYouTubeIframeAPIReady = () => {
			setIsAPIReady(true)
			// Call the existing callback if there was one
			existingCallback?.()
		}

		// If script is already loaded and ready
		if (window.YT && window.YT.Player) {
			setIsAPIReady(true)
		}

		return () => {
			if (player) {
				player.destroy()
				setPlayer(null)
			}
			document.body.removeChild(tag)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // Only run once on mount

	const startProgressTracking = useCallback(() => {
		if (!onProgress) return

		const progressInterval = setInterval(() => {
			if (player?.getCurrentTime && player?.getDuration) {
				const currentTime = player.getCurrentTime()
				const duration = player.getDuration()
				const progress = Math.round((currentTime / duration) * 100)
				onProgress(progress)
			}
		}, 5000)

		return () => clearInterval(progressInterval)
	}, [onProgress, player])

	const onPlayerStateChange = useCallback(
		(event: YT.OnStateChangeEvent) => {
			if (!onProgress) return

			if (event.data === window.YT.PlayerState.ENDED) {
				onProgress(100)
			} else if (event.data === window.YT.PlayerState.PLAYING) {
				clearProgressInterval.current = startProgressTracking()
			} else if (event.data === window.YT.PlayerState.PAUSED) {
				clearProgressInterval.current?.()
			}
		},
		[onProgress, startProgressTracking],
	)

	// Initialize player and handle video changes
	useEffect(() => {
		if (!isAPIReady || typeof window === 'undefined') return

		if (!player && videoId) {
			const newPlayer = new window.YT.Player('youtube-player', {
				width: '100%',
				videoId,
				playerVars: {
					autoplay: 1,
					rel: 0,
				},
				events: {
					onStateChange: onPlayerStateChange,
				},
			})
			setPlayer(newPlayer)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [videoId, isAPIReady, player])

	useEffect(() => {
		if (player) {
			player.loadVideoById(videoId)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [videoId])

	return <div id="youtube-player" className="w-full h-full" />
}
