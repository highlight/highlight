import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Typography } from '../common/Typography/Typography'
import BoxOverlay from './BoxOverlay'

import { AiFillCheckCircle, AiOutlineLink } from 'react-icons/ai'
import styles from './Launch.module.scss'

const DayOne = () => {
	const [copy, setCopy] = useState(false)

	function handleCopy(str: string) {
		navigator.clipboard.writeText(
			process.env.NEXT_PUBLIC_VERCEL_URL + '/launch-week-2' + str,
		)

		setCopy(true)
		setTimeout(() => {
			setCopy(false)
		}, 1000)
	}

	return (
		<div id="day-1" className="w-full max-w-[550px] md:max-w-none">
			<div
				onClick={() => handleCopy('#day-1')}
				className="group flex items-center gap-2 cursor-pointer"
			>
				<Typography
					className="text-darker-copy-on-dark"
					type="copy3"
					emphasis
				>
					Day 1: July 17th
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
					styles.gridContainer,
					'md:grid-cols-2 max-w-[550px] md:max-w-none mx-auto',
				)}
			>
				<div className="grid grid-cols-2 md:grid-rows-2 gap-2">
					<div
						className={classNames(
							'hidden md:block h-full w-full col-span-2',
							styles.gridItem,
						)}
					>
						<div className="absolute">
							<Image
								src="/images/launch/errormonitoring.png"
								alt=""
								height="294"
								width="594"
							/>
						</div>
						<div className="absolute left-0 right-0 top-4">
							<p className={styles.gridTitle}>Error Monitoring</p>
							<div className="flex justify-center">
								<Image
									src="/images/launch/errormonitoringlogo.svg"
									alt=""
									height="60"
									width="60"
								/>
							</div>
						</div>
					</div>
					<Link
						href="/blog/error-monitoring-launch-week-2-new-features"
						className={classNames(
							'h-full w-full col-span-2',
							styles.gridItem,
							styles.gridItemInteractive,
						)}
					>
						<Image
							src="/images/launch/autoresolve.svg"
							alt=""
							height="500"
							width="594"
						/>

						<BoxOverlay
							header="Auto-resolve Errors"
							subheader="Day 1: July 17th"
							badge="Blog Post"
						/>
					</Link>
				</div>

				<Link
					href="/blog/error-monitoring-launch-week-2-new-features"
					className={classNames(
						'bg-black h-[250px] md:h-[450px] w-full col-span-1',
						styles.gridItem,
						styles.gridItemInteractive,
					)}
				>
					<div className="absolute">
						<Image
							src="/images/launch/errorinstance.svg"
							alt=""
							height="500"
							width="594"
						/>
					</div>
					<BoxOverlay
						header="Error Instance View"
						subheader="Day 1: July 17th"
						badge="Blog Post"
					/>
				</Link>
			</div>
		</div>
	)
}

export default DayOne
