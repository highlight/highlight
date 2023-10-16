import { PrimaryButton } from '../../common/Buttons/PrimaryButton'
import { Typography } from '../../common/Typography/Typography'

const CardOverlay = ({
	header,
	subheader,
	buttonText,
	buttonLink,
}: {
	header: string
	subheader?: string
	buttonText?: string
	buttonLink?: string
}) => {
	return (
		<div className="absolute px-3 top-4 left-2 flex-row h-full justify-between">
			<Typography
				className="text-white leading-[28px]"
				type="copy2"
				emphasis
			>
				{header}

				{subheader && (
					<Typography
						className="text-[#EDEDEF] leading-[28px] opacity-70"
						type="copy2"
					>
						{' ' + subheader}
					</Typography>
				)}
			</Typography>

			<div className="absolute bottom-10">
				<PrimaryButton
					className="hover:border-white w-full bg-black border border-darker-copy-on-dark text-white py-2 px-4 transition-all"
					href={buttonLink}
				>
					{buttonText}
				</PrimaryButton>
			</div>
		</div>
	)
}

export default CardOverlay
