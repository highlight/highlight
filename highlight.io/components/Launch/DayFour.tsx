import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Typography } from '../common/Typography/Typography'
import BoxOverlay from './BoxOverlay'

import { AiFillCheckCircle, AiOutlineLink } from 'react-icons/ai'
import styles from './Launch.module.scss'

const DayFour = () => {
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
				onClick={() => handleCopy('#day-4')}
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
				<div className="flex flex-col gap-2 md:w-1/3 max-h-[450px]">
					<div
						className={classNames(
							'hidden md:block h-1/2',
							styles.gridItem,
						)}
					>
						<div className="object-cover">
							<Image
								className="object-fit"
								src="/images/launch/harold.svg"
								alt=""
								height="220"
								width="392"
							/>
						</div>
						<div className="absolute flex flex-col justify-center left-0 right-0 top-0 bottom-4">
							<div>
								<p className={styles.gridTitle}>Harold AI</p>
								<div className="flex justify-center">
									<Image
										src="/images/launch/haroldlogo.svg"
										alt=""
										height="60"
										width="60"
									/>
								</div>
							</div>
						</div>
					</div>
					<Link
						href="/blog/introducing-harold"
						className={classNames(
							'h-1/2 w-full hover:border-[#9479D9] cursor-pointer',
							styles.gridItem,
						)}
					>
						<Image
							className="hidden md:flex"
							src="/images/launch/haroldai.svg"
							alt=""
							height="220"
							width="400"
						/>

						<Image
							className="md:hidden"
							src="/images/launch/haroldai.svg"
							alt=""
							height="22"
							width="500"
						/>

						<BoxOverlay
							header="Harold AI"
							subheader="Day 4: July 20th"
							badge="Blog Post"
						/>
					</Link>
				</div>
				<Link
					href="/blog/introducing-harold"
					className={classNames(
						'h-1/2 max-h-[350px] md:max-h-[450px] w-full hover:border-[#9479D9] cursor-pointer',
						styles.gridItem,
					)}
				>
					<Image
						className="hidden md:flex"
						src="/images/launch/errorresolution.svg"
						alt=""
						height="450"
						width="392"
					/>

					<Image
						className="md:hidden"
						src="/images/launch/errorresolutionmobile.svg"
						alt=""
						height="300"
						width="500"
					/>

					<BoxOverlay
						header="Error Resolution"
						subheader="Day 4: July 20th"
						badge="Blog Post"
					/>
				</Link>

				<Link
					href="/blog/interesting-sessions"
					className={classNames(
						'h-1/2 max-h-[350px] md:max-h-[450px] w-full hover:border-[#9479D9] cursor-pointer',
						styles.gridItem,
					)}
				>
					<Image
						className="hidden md:flex"
						src="/images/launch/sessionsummary.svg"
						alt=""
						height="450"
						width="392"
					/>

					<Image
						className="md:hidden"
						src="/images/launch/sessionsummary.svg"
						alt=""
						height="450"
						width="500"
					/>

					<BoxOverlay
						header="Session Summary"
						subheader="Day 4: July 20th"
						badge="Blog Post"
					/>
				</Link>
			</div>
		</div>
	)
}

export default DayFour
