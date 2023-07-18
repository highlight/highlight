import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Typography } from '../common/Typography/Typography'
import BoxOverlay from './BoxOverlay'

import { AiFillCheckCircle, AiOutlineLink } from 'react-icons/ai'
import styles from './Launch.module.scss'

const DayTwo = () => {
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
		<div id="day-2" className="w-full max-w-[550px] md:max-w-none">
			<div
				onClick={() => handleCopy('#day-2')}
				className="group flex items-center gap-2 cursor-pointer"
			>
				<Typography
					className="text-darker-copy-on-dark"
					type="copy3"
					emphasis
				>
					Day 2: July 18th
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
					'flex flex-col md:flex-row gap-2 max-w-[550px] md:max-w-none mx-auto',
				)}
			>
				<div className="flex flex-col md:w-2/3 gap-2 max-h-[450px]">
					<div
						className={classNames(
							'hidden md:block h-1/2 w-full col-span-1',
							styles.gridItem,
						)}
					>
						<div className="object-cover">
							<Image
								className="object-fit"
								src="/images/launch/sessionreplay.png"
								alt=""
								height="400"
								width="1000"
							/>
						</div>
						<div className="absolute left-0 right-0 top-4">
							<p className={styles.gridTitle}>Session Replay</p>
							<div className="flex justify-center">
								<Image
									src="/images/launch/sessionreplaylogo.svg"
									alt=""
									height="60"
									width="60"
								/>
							</div>
						</div>
					</div>
					<Link
						href="/blog/network-request-panel"
						className={classNames(
							'h-full w-full hover:border-[#9479D9] cursor-pointer md:h-1/2',
							styles.gridItem,
						)}
					>
						<Image
							className="hidden md:flex"
							src="/images/launch/networkrequest.svg"
							alt=""
							height="218"
							width="1000"
						/>

						<Image
							className="md:hidden"
							src="/images/launch/networkrequestmobile.svg"
							alt=""
							height="218"
							width="500"
						/>

						<BoxOverlay
							header="Network Request Summary"
							subheader="Day 2: July 18th"
							badge="Blog Post"
						/>
					</Link>
				</div>

				<Link
					href="/blog/web-socket-recording"
					className={classNames(
						'bg-black h-[250px] md:h-[450px] w-full cursor-pointer hover:border-[#9479D9]',
						styles.gridItem,
					)}
				>
					<div className="absolute">
						<Image
							src="/images/launch/websocket.svg"
							alt=""
							height="450"
							width="550"
						/>
					</div>
					<BoxOverlay
						header="Websocket Recording"
						subheader="Day 2: July 18th"
						badge="Blog Post"
						badgeUnder={true}
					/>
				</Link>
			</div>
		</div>
	)
}

export default DayTwo
