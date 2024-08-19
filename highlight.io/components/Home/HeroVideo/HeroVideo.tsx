import { useCallback, useEffect, useState } from 'react'

import classNames from 'classnames'
import Image from 'next/legacy/image'
import { FaTimes } from 'react-icons/fa'
import Jay from '../../../public/images/jay.png'
import PlayButton from '../../../public/images/playButton.svg'
import VideoThumbnail from '../../../public/images/thumbnail.svg'
import { Typography } from '../../common/Typography/Typography'
import styles from '../../Home/Home.module.scss'

// When someone scrolls with the video open we close the video after scrolling
// this many pixels.
const SCROLL_THRESHOLD = 50

export const HeroVideo = () => {
	const [hideVideo, setHideVideo] = useState(true)
	const [scrollPosition, setScrollPosition] = useState(0)

	const showVideo = () => {
		setScrollPosition(window.scrollY)
		setHideVideo(false)
	}

	const scrollHandler = useCallback(() => {
		if (hideVideo) {
			return
		}

		if (Math.abs(window.scrollY - scrollPosition) > SCROLL_THRESHOLD) {
			setHideVideo(true)
		}
	}, [hideVideo, scrollPosition])

	useEffect(() => {
		window.removeEventListener('scroll', scrollHandler)
		window.addEventListener('scroll', scrollHandler)

		return () => window.removeEventListener('scroll', scrollHandler)
	}, [scrollHandler])

	return (
		<div
			className={classNames(
				styles.anchorImage,
				styles.heroImage,
				styles.imageInner,
			)}
		>
			<div
				className={classNames(styles.videoModal, {
					[styles.hideVideo]: hideVideo,
				})}
			>
				<div
					className={styles.modalBg}
					onClick={() => setHideVideo(true)}
				>
					<div className={styles.modalClose}>
						<FaTimes />
					</div>
				</div>
				<div>
					{!hideVideo && (
						<video controls autoPlay>
							<source
								src="/images/herovideo.mp4"
								type="video/mp4"
							/>
						</video>
					)}
				</div>
			</div>
			<div className={styles.playButton} onClick={showVideo}>
				<div className={styles.jayImage}>
					<Image src={Jay} alt="Jay" />
				</div>
				<div className={styles.playButtonIcon}>
					<Image src={PlayButton} alt="" />
				</div>
				<div className={styles.playCard}>
					<Typography type="copy1" emphasis>
						Watch Jay demo Highlight
					</Typography>
					<Typography type="copy2">Under 2 minutes</Typography>
				</div>
			</div>
			<div className={styles.thumbnail} onClick={showVideo}>
				<Image src={VideoThumbnail} alt="" />
			</div>
		</div>
	)
}
