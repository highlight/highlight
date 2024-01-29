import classNames from 'classnames'
import { Typography } from '../../common/Typography/Typography'

import { BsTwitter } from 'react-icons/bs'
import styles from './Launch.module.scss'

const HiddenDay = ({ title }: { title: string }) => {
	return (
		<div id="day-1" className="w-full max-w-[550px] md:max-w-none z-50">
			<div className="w-full h-6 border-x-[1px] text-black mx-auto max-w-[550px] md:max-w-[1200px]" />
			<div className="flex flex-col gap-2 lg:flex-row justify-between items-center border-x-[1px] border-b-[1px] lg:h-[58px] px-4">
				<Typography className="text-[#6F6E77]" type="copy3" emphasis>
					{title}
				</Typography>
			</div>

			<div
				className={classNames(
					'grid-rows-1 md:grid-cols-2 max-w-[550px] md:max-w-none mx-auto h-[250px] md:h-[450px]',
				)}
			>
				<div
					className={classNames(
						'col-span-2 border-[1px] h-[250px] md:h-[450px] w-full',
						styles.gridItem,
					)}
				>
					<div className="flex flex-col h-full justify-center">
						<div className="flex flex-col gap-2 items-center mx-auto">
							<Typography
								className="bg-[#6F6E77] bg-opacity-[0.2] px-4 py-1 text-[#6F6E77] rounded-md "
								type="copy3"
								emphasis
							>
								Check back later
							</Typography>
							<a
								target="_blank"
								href="https://twitter.com/highlightio"
								rel="noopener noreferrer"
								className="group flex gap-2 items-center "
							>
								<BsTwitter className="h-5 w-5 text-[#26a7de]" />
								<Typography
									className="text-[#6f6e77] group-hover:text-[#26a7de]"
									type="copy3"
									emphasis
								>
									Follow for more updates
								</Typography>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
export default HiddenDay
