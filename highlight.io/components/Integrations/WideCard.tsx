import classNames from 'classnames'
import Image from 'next/image'
import { PrimaryButton } from '../common/Buttons/PrimaryButton'
import { Typography } from '../common/Typography/Typography'
import styles from '../Home/Home.module.scss'

const WideCard = ({
	title,
	primaryLink,
	secondaryLink,
	primaryLinkText,
	secondaryLinkText,
	desc,
}: {
	title: string
	primaryLink: string
	primaryLinkText: string
	desc: string
	secondaryLink?: string
	secondaryLinkText?: string
}) => {
	return (
		<div className="flex w-full flex-col md:flex-row justify-between items-start md:items-center p-4 border-[1px] border-divider-on-dark rounded-lg">
			<div className="flex flex-col md:flex-row gap-4 md:items-center">
				<Image
					src={'/images/companies/icons/highlight.png'}
					alt="logo"
					height="50"
					width="50"
					className="rounded-md flex-shrink-0 w-[50px] h-[50px]"
				/>
				<div className="flex flex-col ">
					<Typography
						type="copy1"
						emphasis
						className="text-color-copy-on-dark"
					>
						{title}
					</Typography>
					<Typography
						type="copy3"
						className="text-color-darker-copy-on-dark"
					>
						{desc}
					</Typography>
				</div>
			</div>
			<div className="flex flex-col lg:flex-row gap-4 mt-4 w-full md:w-auto md:mt-0">
				{secondaryLink && secondaryLinkText && (
					<PrimaryButton
						className={classNames(
							styles.hollowButton,
							'max-h-10 flex flex-col justify-center',
						)}
						href={secondaryLink}
					>
						{secondaryLinkText}
					</PrimaryButton>
				)}
				<PrimaryButton
					className={classNames(
						'max-h-10 flex flex-col justify-center text-center flex-shrink-0 md:ml-8 whitespace-nowrap',
					)}
					href={primaryLink}
				>
					{primaryLinkText}
				</PrimaryButton>
			</div>
		</div>
	)
}

export default WideCard
