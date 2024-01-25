import classNames from 'classnames'
import Image from 'next/image'
import { useState } from 'react'
import { Typography } from '../../common/Typography/Typography'

import { AiFillCheckCircle, AiOutlineLink } from 'react-icons/ai'
import { HiPlay } from 'react-icons/hi2'
import CardOverlay from './CardOverlay'
import styles from './Launch.module.scss'

const DayFour = () => {
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
		<div id="day-4" className="w-full max-w-[550px] md:max-w-none z-50">
			<div className="flex justify-between items-center">
				<div className="group flex items-center gap-2 w-1/2 cursor-pointer">
					<Typography
						className="text-darker-copy-on-dark"
						type="copy3"
						emphasis
					>
						Day 4: October 19th
					</Typography>

					<a
						className="flex items-center gap-1 border border-[#34343A] text-darker-copy-on-dark px-4 py-1 rounded-full"
						href="https://www.youtube.com/watch?v=r0DINzrVb_s"
						target="_blank"
						rel="noopener noreferrer"
					>
						<HiPlay />

						<Typography
							className="text-darker-copy-on-dark"
							type="copy4"
							emphasis
						>
							Watch video
						</Typography>
					</a>
				</div>
				<div
					onClick={() => handleCopy('#day-4')}
					className="group flex justify-end w-1/2"
				>
					{!copy && (
						<AiOutlineLink className="text-copy-on-light h-5 w-5" />
					)}
					{copy && (
						<AiFillCheckCircle className="text-copy-on-light h-5 w-5" />
					)}
				</div>
			</div>

			<div
				className={classNames(
					'flex flex-col md:flex-row gap-5 max-w-[550px] md:max-w-none mx-auto mt-3',
				)}
			>
				<div
					className={classNames(
						'md:w-2/5 max-h-[450px]',
						styles.gridItem,
					)}
				>
					<div className="object-cover">
						<Image
							className="object-fit"
							src="/images/launch/week-3/filtering.svg"
							alt=""
							height="448"
							width="440"
						/>
					</div>

					<CardOverlay
						header="Ingest filtering."
						subheader="You can now ingest per product!"
						buttonText="View Blog Post"
						buttonLink="/blog/filtering-and-sampling-ingest"
					/>
				</div>
				<div className="flex flex-col md:w-2/5 gap-2 max-h-[450px]">
					<div
						className={classNames(
							'group h-full w-full min-h-[350px]',
							styles.gridItem,
						)}
					>
						<Image
							className="flex object-fit"
							src="/images/launch/week-3/betatraces.svg"
							alt=""
							height="448"
							width="440"
						/>

						<CardOverlay
							header="Traces in beta."
							buttonText="View Blog Post"
							buttonLink="/blog/tracing-in-highlight"
						/>
					</div>
				</div>
				<div className="flex flex-col md:w-1/5 gap-2 max-h-[450px]">
					<div
						className={classNames(
							'group h-full w-full min-h-[350px]',
							styles.gridItem,
						)}
					>
						<Image
							className="flex object-fit"
							src="/images/launch/week-3/clickhouse.svg"
							alt=""
							height="448"
							width="282"
						/>

						<CardOverlay
							header="Clickhouse migration."
							buttonText="View Blog Post"
							buttonLink="/blog/migrating-opensearch-to-clickhouse"
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
export default DayFour
