import classNames from 'classnames'
import Image from 'next/image'
import { useState } from 'react'
import { Typography } from '../../common/Typography/Typography'

import { AiFillCheckCircle, AiOutlineLink } from 'react-icons/ai'
import CardOverlay from './CardOverlay'
import styles from './Launch.module.scss'

const DayTwo = () => {
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
		<div id="day-2" className="w-full max-w-[550px] md:max-w-none z-50">
			<div
				onClick={() => handleCopy('#day-2')}
				className="group flex items-center gap-2 cursor-pointer"
			>
				<Typography
					className="text-darker-copy-on-dark"
					type="copy3"
					emphasis
				>
					Day 2: October 17th
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
						'md:w-1/2 max-h-[450px]',
						styles.gridItem,
					)}
				>
					<div className="object-cover">
						<Image
							className="flex object-fit"
							src="/images/launch/week-3/verceledge.svg"
							alt=""
							height="448"
							width="590"
						/>
					</div>

					<CardOverlay
						header="Full support for Vercel's edge runtime."
						buttonText="View Blogpost"
						buttonLink="/blog/vercel-edge-support"
					/>
				</div>
				<div className="flex flex-col md:w-1/2 gap-2 max-h-[450px]">
					<div
						className={classNames(
							'group h-full w-full min-h-[350px]',
							styles.gridItem,
						)}
					>
						<Image
							className="flex object-fit"
							src="/images/launch/week-3/services.svg"
							alt=""
							height="448"
							width="590"
						/>

						<CardOverlay header="Introducing services and service filters." />
					</div>
				</div>
			</div>
		</div>
	)
}
export default DayTwo
