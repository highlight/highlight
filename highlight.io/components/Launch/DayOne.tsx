import classNames from 'classnames'
import Image from 'next/image'
import { Typography } from '../common/Typography/Typography'
import BoxOverlay from './BoxOverlay'
import styles from './Launch.module.scss'

const DayOne = () => {
	return (
		<div className="w-full max-w-[550px] md:max-w-none">
			<Typography
				className="text-darker-copy-on-dark"
				type="copy3"
				emphasis
			>
				Day 1: July 20th
			</Typography>
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
					<div
						className={classNames(
							'h-full w-full col-span-2',
							styles.gridItem,
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
							subheader="Day 1: July 20th"
							badge="Blog Post"
						/>
					</div>
				</div>

				<div
					className={classNames(
						'bg-black h-[250px] md:h-[450px] w-full col-span-1',
						styles.gridItem,
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
						subheader="Day 1: July 20th"
						badge="Blog Post"
					/>
				</div>
			</div>
		</div>
	)
}

export default DayOne
