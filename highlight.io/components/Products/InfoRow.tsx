import Image from 'next/image'
import styles from './Products.module.scss'
import classNames from 'classnames'
import { Typography } from '../common/Typography/Typography'
import { PrimaryButton } from '../../components/common/Buttons/PrimaryButton'
import React from 'react'
import { ObfuscationSlider } from '../Home/ObfuscationSlider/ObfuscationSlider'

//Component for the image/text row for the footer of the product page
//invert puts the image on the right side of the text
const InfoRow = ({
	title,
	desc,
	link,
	linkText,
	invert,
	privacy,
	imgSrc,
}: {
	title: string
	desc: string
	link: string
	linkText: string
	invert?: boolean
	privacy?: boolean
	imgSrc?: any
}) => {
	return (
		<div className="flex flex-col lg:flex-row justify-center items-center gap-16 xl:gap-32">
			<div
				className={`${
					invert ? 'lg:hidden ' : ''
				} flex justify-center lg:w-[570px] w-full h-full`}
			>
				{privacy ? (
					<ObfuscationSlider />
				) : (
					<Image src={imgSrc} alt="" />
				)}
			</div>
			<div className="lg:w-1/2 text-center lg:text-left">
				<h3 className={styles.infoTitle}>{title}</h3>
				<Typography type="copy2" onDark>
					<p className="text-color-copy-on-dark md:text-xl">{desc}</p>
				</Typography>
				<div className="flex justify-center lg:justify-start">
					<PrimaryButton
						href={link}
						className={classNames(
							styles.hollowButton,
							styles.docsButton,
							'mt-5',
						)}
					>
						<Typography type="copy2" emphasis={true}>
							{linkText}
						</Typography>
					</PrimaryButton>
				</div>
			</div>
			<div
				className={`${
					invert ? 'lg:flex' : ''
				} hidden justify-center lg:w-[570px]`}
			>
				{privacy ? (
					<ObfuscationSlider />
				) : (
					<Image src={imgSrc} alt="" />
				)}
			</div>
		</div>
	)
}

export default InfoRow
