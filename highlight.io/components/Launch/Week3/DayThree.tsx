import classNames from 'classnames'
import Image from 'next/image'
import { useState } from 'react'
import { Typography } from '../../common/Typography/Typography'

import { AiFillCheckCircle, AiOutlineLink } from 'react-icons/ai'
import CardOverlay from './CardOverlay'
import styles from './Launch.module.scss'

const DayThree = () => {
	const [copy, setCopy] = useState(false)

	function handleCopy(str: string) {
		navigator.clipboard.writeText(
			'https://highlight.io/launch/week-3' + str,
		)

		setCopy(true)
		setTimeout(() => {
			setCopy(false)
		}, 1000)
	}

	return (
		<div id="day-3" className="w-full max-w-[550px] md:max-w-none z-50">
			<div
				onClick={() => handleCopy('#day-1')}
				className="group flex items-center gap-2 cursor-pointer"
			>
				<Typography
					className="text-darker-copy-on-dark"
					type="copy3"
					emphasis
				>
					Day 3: October 18th
				</Typography>
				{!copy && (
					<AiOutlineLink className="text-copy-on-light h-5 w-5 invisible group-hover:visible" />
				)}
				{copy && (
					<AiFillCheckCircle className="text-copy-on-light h-5 w-5 invisible group-hover:visible" />
				)}
			</div>

			<div
				className={classNames(
					'flex flex-col md:flex-row gap-5 max-w-[550px] md:max-w-none mx-auto mt-3',
				)}
			>
				<div
					className={classNames(
						'md:w-1/3 max-h-[450px]',
						styles.gridItem,
					)}
				>
					<div className="object-cover">
						<Image
							className="flex object-fit"
							src="/images/launch/week-3/downloads.svg"
							alt=""
							height="448"
							width="387"
						/>
					</div>

					<CardOverlay header="Session Downloads." />
				</div>
				<div
					className={classNames(
						'md:w-1/3 max-h-[450px]',
						styles.gridItem,
					)}
				>
					<div className="object-cover">
						<Image
							className="flex object-fit"
							src="/images/launch/week-3/privacy.svg"
							alt=""
							height="448"
							width="387"
						/>
					</div>

					<CardOverlay
						header="Default privacy mode."
						buttonText="View Blogpost"
						buttonLink="/blog/default-privacy-mode"
					/>
				</div>
				<div
					className={classNames(
						'md:w-1/3 max-h-[450px]',
						styles.gridItem,
					)}
				>
					<div className="object-cover">
						<Image
							className="flex object-fit"
							src="/images/launch/week-3/perf.svg"
							alt=""
							height="448"
							width="387"
						/>
					</div>

					<CardOverlay
						header="Understanding session replay performance."
						subheader="Check out how session replay affects web apps."
						buttonText="View Blogpost"
						buttonLink="/blog/session-replay-performance"
					/>
				</div>
			</div>
		</div>
	)
}
export default DayThree
