import classNames from 'classnames'
import Image from 'next/image'
import { PrimaryButton } from '../common/Buttons/PrimaryButton'
import { Typography } from '../common/Typography/Typography'
import styles from '../Home/Home.module.scss'

const MissingCard = ({ link, desc }: { link: string; desc: string }) => {
	return (
		<div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 mt-16 border-[1px] border-divider-on-dark rounded-lg">
			<div className="flex flex-col md:flex-row gap-4">
				<Image
					src={'/images/companies/icons/highlight.png'}
					alt="logo"
					height="50"
					width="50"
					className="rounded-md flex-shrink-0 w-[50px] h-[50px]"
				/>
				<div className="flex flex-col gap-1">
					<Typography
						type="copy1"
						emphasis
						className="text-color-copy-on-dark"
					>
						Are we missing anything?
					</Typography>
					<Typography
						type="copy3"
						className="text-color-darker-copy-on-dark"
					>
						{desc}
					</Typography>
				</div>
			</div>
			<div className="mt-4 w-full md:w-auto md:mt-0">
				<PrimaryButton
					className={classNames(
						styles.hollowButton,
						'max-h-10 flex flex-col justify-center',
					)}
					href="https://discord.gg/yxaXEAqgwN"
				>
					Get in Touch
				</PrimaryButton>
			</div>
		</div>
	)
}

export default MissingCard
