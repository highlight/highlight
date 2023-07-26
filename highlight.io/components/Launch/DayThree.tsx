import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Typography } from '../common/Typography/Typography'
import BoxOverlay from './BoxOverlay'

import { AiFillCheckCircle, AiOutlineLink } from 'react-icons/ai'
import styles from './Launch.module.scss'

const DayThree = () => {
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
		<div id="day-3" className="w-full max-w-[550px] md:max-w-none">
			<div
				onClick={() => handleCopy('#day-3')}
				className="group flex items-center gap-2 cursor-pointer"
			>
				<Typography
					className="text-darker-copy-on-dark"
					type="copy3"
					emphasis
				>
					Day 3: July 19th
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
						'hidden md:block md:w-1/3 lg:w-1/4 max-h-[450px]',
						styles.gridItem,
					)}
				>
					<div className="object-cover">
						<Image
							className="object-fit"
							src="/images/launch/logging.svg"
							alt=""
							height="448"
							width="300"
						/>
					</div>
					<div className="absolute flex flex-col justify-center left-0 right-0 top-0 bottom-8">
						<div>
							<p className={styles.gridTitle}>Logging</p>
							<div className="flex justify-center">
								<Image
									src="/images/launch/logginglogo.svg"
									alt=""
									height="60"
									width="60"
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="flex flex-col md:w-2/3 lg:w-3/4 gap-2 max-h-[450px]">
					<Link
						href="/blog/building-our-logging-integrations"
						className={classNames(
							'h-full w-full hover:border-[#9479D9] cursor-pointer',
							styles.gridItem,
						)}
					>
						<Image
							className="hidden lg:flex"
							src="/images/launch/loggingintegrations.svg"
							alt=""
							height="448"
							width="900"
						/>

						<Image
							className="min-h-full hidden md:flex lg:hidden"
							src="/images/launch/loggingintegrationsmobile.svg"
							alt=""
							height="325"
							width="650"
						/>

						<Image
							className="min-h-full md:hidden"
							src="/images/launch/loggingintegrationsmobile.svg"
							alt=""
							height="325"
							width="500"
						/>

						<BoxOverlay
							header="New Logging Integrations"
							subheader="Day 3: July 19th"
							badge="Blog Post"
						/>
					</Link>
				</div>
			</div>
		</div>
	)
}

export default DayThree
