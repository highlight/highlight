import classNames from 'classnames'
import Image from 'next/image'
import { useState } from 'react'
import { Typography } from '../../common/Typography/Typography'

import { AiFillCheckCircle, AiOutlineLink } from 'react-icons/ai'
import CardOverlay from './CardOverlay'
import styles from './Launch.module.scss'

const DayOne = () => {
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
		<div id="day-1" className="w-full max-w-[550px] md:max-w-none z-50">
			<div
				onClick={() => handleCopy('#day-1')}
				className="group flex items-center gap-2 cursor-pointer"
			>
				<Typography
					className="text-darker-copy-on-dark"
					type="copy3"
					emphasis
				>
					Day 1: October 16th
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
					'flex flex-col md:flex-row gap-2 max-w-[550px] md:max-w-none mx-auto mt-3',
				)}
			>
				<div
					className={classNames(
						'md:w-1/3 lg:w-1/4 max-h-[450px]',
						styles.gridItem,
					)}
				>
					<div className="object-cover">
						<Image
							className="hidden md:flex object-fit"
							src="/images/launch/week-3/harold.svg"
							alt=""
							height="448"
							width="300"
						/>

						<Image
							className="md:hidden object-fit"
							src="/images/launch/week-3/harold.svg"
							alt=""
							height="448"
							width="500"
						/>
					</div>

					<CardOverlay
						header="Updates to Harold AI."
						subheader="Harold can now identify error types!"
						buttonText="View Blogpost"
						buttonLink="https://news.ycombinator.com/item?id=37675894"
					/>
				</div>
				<div className="flex flex-col md:w-2/3 lg:w-3/4 gap-2 max-h-[450px]">
					<div
						className={classNames(
							'group h-full w-full min-h-[350px]',
							styles.gridItem,
						)}
					>
						<Image
							className="hidden lg:flex object-fit"
							src="/images/launch/week-3/githubtraces.svg"
							alt=""
							height="448"
							width="900"
						/>
						<Image
							className="hidden md:block lg:hidden object-fit"
							src="/images/launch/week-3/githubtracesmobile.svg"
							alt=""
							height="250"
							width="625"
						/>
						<Image
							className="lg:hidden object-fit"
							src="/images/launch/week-3/githubtracesmobile.svg"
							alt=""
							height="448"
							width="550"
						/>

						<CardOverlay
							header="GitHub-enhanced stacktraces."
							buttonText="View Blog Post"
							buttonLink="/blog/github-enhanced-stacktraces"
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
export default DayOne
