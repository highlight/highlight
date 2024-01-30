import {
	HiCube,
	HiSearchCircle,
	HiSparkles,
	HiTemplate,
	HiTerminal,
} from 'react-icons/hi'
import { Typography } from '../../common/Typography/Typography'

const icons = {
	1: <HiTerminal className="text-[#6F6E77]" />,
	2: <HiSearchCircle className="text-[#6F6E77]" />,
	3: <HiTemplate className="text-[#6F6E77]" />,
	4: <HiSparkles className="text-[#6F6E77]" />,
	5: <HiCube className="text-[#6F6E77]" />,
}

type IconKeys = keyof typeof icons

const CardOverlay = ({
	header,
	subheader,
	category,
	buttonText,
	buttonLink,
	halfWidth,
	slot,
}: {
	header: string
	subheader?: string
	category: string
	slot: IconKeys
	halfWidth?: boolean
	buttonText?: string
	buttonLink?: string
}) => {
	return (
		<div
			className={`absolute px-3 top-4 left-2 h-full flex flex-col gap-2 ${
				halfWidth ? 'w-1/2' : ''
			}`}
		>
			<div className="flex items-center gap-2 opacity-80">
				{icons[slot]}
				<Typography
					className="text-[#6F6E77] leading-[28px]"
					type="copy3"
					emphasis
				>
					{category}
				</Typography>
			</div>
			<Typography
				className="text-[#1A1523] leading-[28px]"
				type="copy1"
				emphasis
			>
				{header}

				{subheader && (
					<Typography
						className="text-[#6F6E77] leading-[28px]"
						type="copy1"
					>
						{' ' + subheader}
					</Typography>
				)}
			</Typography>
		</div>
	)
}

export default CardOverlay
