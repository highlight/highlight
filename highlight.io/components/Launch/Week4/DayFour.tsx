import classNames from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Typography } from '../../common/Typography/Typography'

import { HiBookOpen, HiDocumentText, HiPlay } from 'react-icons/hi2'

import CardOverlay from './CardOverlay'
import styles from './Launch.module.scss'

const DayFour = () => {
	const [copy, setCopy] = useState(false)

	function handleCopy(str: string) {
		navigator.clipboard.writeText(
			'https://highlight.io/launch/week-4' + str,
		)

		setCopy(true)
		setTimeout(() => {
			setCopy(false)
		}, 1000)
	}

	return (
		<div id="day-4" className="w-full max-w-[550px] md:max-w-none z-50">
			<div className="w-full h-6 border-x-[1px] border-[#C8C7CB] text-black mx-auto max-w-[550px] md:max-w-[1200px]" />
			<div className="flex flex-col gap-2 lg:flex-row justify-between items-center border-x-[1px] border-b-[1px] border-[#C8C7CB] lg:h-[58px] px-4">
				<Typography className="text-[#6F6E77]" type="copy3" emphasis>
					Day 4: February 1
				</Typography>

				<div className="flex flex-wrap justify-center lg:justify-end items-center gap-2 mb-4 lg:mb-0">
					<Link
						className="flex flex-shrink-0 items-center gap-1 border border-[#E4E2E4] text-[#6F6E77] px-4 py-1 rounded-[6px] hover:bg-black hover:text-white hover:border-opacity-70 transition-all"
						href="/docs/getting-started/overview#for-your-backend-tracing"
					>
						<HiDocumentText />

						<Typography type="copy4" emphasis>
							Learn more
						</Typography>
					</Link>
					<Link
						className="flex flex-shrink-0 items-center gap-1 border border-[#E4E2E4] text-[#6F6E77] px-4 py-1 rounded-[6px] hover:bg-black hover:text-white hover:border-opacity-70 transition-all"
						href="/blog/lw4-d4-tracing-sdk-support"
					>
						<HiBookOpen />

						<Typography type="copy4" emphasis>
							Read Blog Post
						</Typography>
					</Link>
					<a
						className="flex flex-shrink-0 items-center gap-1 border border-[#E4E2E4] text-[#6F6E77] px-4 py-1 rounded-[6px] hover:bg-black hover:text-white hover:border-opacity-70 transition-all"
						href="https://youtu.be/xKk-xmQcS6A"
						target="_blank"
						rel="noopener noreferrer"
					>
						<HiPlay />

						<Typography type="copy4" emphasis>
							Watch video
						</Typography>
					</a>

					{/* <div */}
					{/* 	onClick={() => handleCopy('#day-1')} */}
					{/* 	className="group flex justify-end w-1/2" */}
					{/* > */}
					{/* 	{!copy && ( */}
					{/* 		<AiOutlineLink className="text-copy-on-light h-5 w-5" /> */}
					{/* 	)} */}
					{/* 	{copy && ( */}
					{/* 		<AiFillCheckCircle className="text-copy-on-light h-5 w-5" /> */}
					{/* 	)} */}
					{/* </div> */}
				</div>
			</div>

			<div
				className={classNames(
					'flex flex-col md:flex-row w-full gap-5 mx-auto border-x-[1px] border-b-[1px] border-[#C8C7CB]',
				)}
			>
				<div
					className={classNames(
						'h-full w-full min-h-[450px]',
						styles.gridItem,
					)}
				>
					<Image
						className="hidden md:flex object-cover h-[450px] absolute object-left"
						src="/images/launch/week-4/sdk.webp"
						alt=""
						height="450"
						width="1150"
					/>
					<Image
						className="flex md:hidden object-cover h-[350px] absolute bottom-0 object-left"
						src="/images/launch/week-4/sdk.webp"
						alt=""
						height="350"
						width="1198"
					/>
					<CardOverlay
						header="Your favorite SDKs now supported by Highlight.io."
						category="SDKs"
						slot={5}
						halfWidth
					/>
				</div>
			</div>
		</div>
	)
}
export default DayFour
