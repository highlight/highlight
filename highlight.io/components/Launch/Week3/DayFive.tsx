import classNames from 'classnames'
import Image from 'next/image'
import { useState } from 'react'
import { Typography } from '../../common/Typography/Typography'

import { AiFillCheckCircle, AiOutlineLink } from 'react-icons/ai'
import CardOverlay from './CardOverlay'
import styles from './Launch.module.scss'

const DayFive = () => {
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
		<div id="day-5" className="w-full max-w-[550px] md:max-w-none z-50">
			<div
				onClick={() => handleCopy('#day-5')}
				className="group flex items-center gap-2 cursor-pointer"
			>
				<Typography
					className="text-darker-copy-on-dark"
					type="copy3"
					emphasis
				>
					Day 5: October 20th
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
						'md:w-4/12 max-h-[450px]',
						styles.gridItem,
					)}
				>
					<div className="object-cover">
						<Image
							className="object-fit"
							src="/images/launch/week-3/otel.svg"
							alt=""
							height="448"
							width="300"
						/>
					</div>

					<CardOverlay
						header="OTEL Vendor."
						subheader="Highlight is officially an OTEL vendor."
						buttonText="View Page"
						buttonLink="https://opentelemetry.io/ecosystem/vendors/"
					/>
				</div>

				<div className="flex flex-col md:w-5/12 gap-2 max-h-[450px]">
					<div
						className={classNames(
							'group h-full w-full min-h-[350px]',
							styles.gridItem,
						)}
					>
						<Image
							className="object-fit"
							src="/images/launch/week-3/startups.svg"
							alt=""
							height="448"
							width="575"
						/>

						<CardOverlay
							header="Highlight for Startups"
							subheader="We started a special deal for all startups. Be sure to check it out!"
							buttonText="View Page"
							buttonLink="/startups"
						/>
					</div>
				</div>
				<div className="flex flex-col md:w-1/4 gap-2 max-h-[450px]">
					<div
						className={classNames(
							'group h-full w-full min-h-[350px]',
							styles.gridItem,
						)}
					>
						<Image
							className="object-fit"
							src="/images/launch/week-3/algora.svg"
							alt=""
							height="448"
							width="300"
						/>

						<CardOverlay
							header="Algora Bounties"
							subheader="Contribute and get paid!"
							buttonText="View Page"
							buttonLink="https://console.algora.io/org/highlight"
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
export default DayFive
