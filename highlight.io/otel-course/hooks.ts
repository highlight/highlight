'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { CourseVideo, CourseVideoProgress } from './types'

const PROGRESS_STORAGE_KEY = 'otel_course_progress'
const LOCAL_STORAGE_KEY = 'otel_course_auth'
export const OTEL_COURSE_LOCAL_STORAGE_KEY = 'highlight_otel_course_authorized'

export const useVideoProgress = (courseVideos: CourseVideo[]) => {
	const [videoProgressData, setVideoProgressData] = useState<
		CourseVideoProgress[]
	>([])

	useEffect(() => {
		const storedProgress =
			typeof window !== 'undefined'
				? localStorage.getItem(PROGRESS_STORAGE_KEY)
				: null
		const storedProgressJson = storedProgress
			? JSON.parse(storedProgress)
			: null

		setVideoProgressData(
			storedProgressJson && storedProgressJson.length > 0
				? storedProgressJson
				: courseVideos.map((video) => ({
						videoId: video.id,
						progress: 0,
						started: false,
					})),
		)
	}, [courseVideos])

	useEffect(() => {
		localStorage.setItem(
			PROGRESS_STORAGE_KEY,
			JSON.stringify(videoProgressData),
		)
	}, [videoProgressData])

	const updateProgress = useCallback((videoId: string, progress: number) => {
		setVideoProgressData((prevData) =>
			prevData.map((video) =>
				video.videoId === videoId
					? { ...video, progress, started: true }
					: video,
			),
		)
	}, [])

	const findProgress = useCallback(
		(videoId: string | undefined) => {
			return (
				videoProgressData.find((vp) => vp.videoId === videoId) ?? {
					videoId,
					progress: 0,
					started: false,
				}
			)
		},
		[videoProgressData],
	)

	return { updateProgress, findProgress }
}

export const useSignupToast = () => {
	const [showToast, setShowToast] = useState(false)
	const router = useRouter()

	useEffect(() => {
		const signedup = new URLSearchParams(window.location.search).get(
			'signedup',
		)

		if (signedup) {
			setShowToast(true)
			const timer = setTimeout(() => {
				setShowToast(false)
				history.replaceState({}, '', window.location.pathname)
			}, 4000)

			return () => clearTimeout(timer)
		} else {
			setShowToast(false)
		}
	}, [router])

	return showToast
}

export const useAuthorization = () => {
	const [isAuthorized, setIsAuthorized] = useState(false)
	const router = useRouter()

	useEffect(() => {
		const authorized = localStorage.getItem(LOCAL_STORAGE_KEY) === 'true'
		setIsAuthorized(true) // Currently always authorized as per commented code
		// if (!authorized && typeof window !== 'undefined') {
		//     router.push('/otel-course/signup')
		// } else {
		//     setIsAuthorized(true)
		// }
	}, [router])

	return isAuthorized
}
