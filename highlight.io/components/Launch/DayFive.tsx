import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Typography } from '../common/Typography/Typography'
import BoxOverlay from './BoxOverlay'

import { AiFillCheckCircle, AiOutlineLink } from 'react-icons/ai'
import styles from './Launch.module.scss'

const DayFive = () => {
	const [copy, setCopy] = useState(false)

	function handleCopy(str: string) {
		navigator.clipboard.writeText(
			'https://highlight.io/launch-week-2' + str,
		)

		setCopy(true)
		setTimeout(() => {
			setCopy(false)
		}, 1000)
	}

	return (
		<div id="day-5" className="w-full max-w-[550px] md:max-w-none">
			<div
				onClick={() => handleCopy('#day-5')}
				className="group flex items-center gap-2 cursor-pointer"
			>
				<Typography
					className="text-darker-copy-on-dark"
					type="copy3"
					emphasis
				>
					Day 4: July 20th
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
				<Link
					href="/blog/using-github-as-a-headless-cms"
					className={classNames(
						'h-full max-h-[450px] md:w-1/3 lg:w-1/2  hover:border-[#9479D9] cursor-pointer',
						styles.gridItem,
					)}
				>
					<Image
						className="block -translate-x-[4%]"
						src="/images/launch/githubcms.svg"
						alt=""
						height="448"
						width="600"
					/>

					<BoxOverlay
						header="Using Github as a CMS"
						subheader="Day 5: July 21th"
						badge="Blog Post"
					/>
				</Link>
				<Link
					href="https://www.highlight.io/blog/java-sdk-open-source-contribution"
					className={classNames(
						'h-1/2 max-h-[350px] md:max-h-[450px]  md:w-1/3 lg:w-1/4 hover:border-[#9479D9] cursor-pointer',
						styles.gridItem,
					)}
				>
					<Image
						className="hidden md:flex"
						src="/images/launch/contributors.svg"
						alt=""
						height="448"
						width="300"
					/>

					<Image
						className="md:hidden"
						src="/images/launch/contributorsmobile.svg"
						alt=""
						height="335"
						width="500"
					/>

					<BoxOverlay
						header="Contributors"
						subheader="Day 5: July 21th"
						badge="Blog Post"
						badgeUnder
					/>
				</Link>

				<Link
					href="https://www.youtube.com/@highlight-io"
					className={classNames(
						'h-1/2 max-h-[350px] md:max-h-[450px] md:w-1/3 lg:w-1/4 hover:border-[#9479D9] cursor-pointer',
						styles.gridItem,
					)}
				>
					<Image
						className="hidden md:flex"
						src="/images/launch/youtube.svg"
						alt=""
						height="448"
						width="300"
					/>

					<Image
						className="md:hidden"
						src="/images/launch/youtubemobile.svg"
						alt=""
						height="450"
						width="500"
					/>

					<BoxOverlay
						header="YouTube Launch"
						subheader="Day 5: July 21th"
						badge="YouTube"
						badgeUnder
					/>
				</Link>
			</div>
		</div>
	)
}

export default DayFive
