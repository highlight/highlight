import classNames from 'classnames'
import { BsTwitter } from 'react-icons/bs'
import { Typography } from '../../common/Typography/Typography'

import styles from './Launch.module.scss'

const HiddenDay = ({ title }: { title: string }) => {
	return (
		<div id="day-1" className="w-full max-w-[550px] md:max-w-none">
			<div className="group flex items-center gap-2 cursor-pointer">
				<Typography
					className="text-darker-copy-on-dark"
					type="copy3"
					emphasis
				>
					{title}
				</Typography>
			</div>

			<div
				className={classNames(
					styles.gridContainer,
					'grid-rows-1 md:grid-cols-2 max-w-[550px] md:max-w-none mx-auto h-[250px] md:h-[450px]',
				)}
			>
				<div
					className={classNames(
						'col-span-2 bg-black border-[2px] border-[#34343A] h-[250px] md:h-[450px] w-full',
						styles.gridItem,
					)}
				>
					<div className="flex flex-col h-full justify-center">
						<div className="flex flex-col gap-2 items-center mx-auto">
							<Typography
								className="px-4 py-1 bg-[#34343A] text-copy-on-dark rounded-md "
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
									className="text-copy-on-light group-hover:text-[#26a7de]"
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
