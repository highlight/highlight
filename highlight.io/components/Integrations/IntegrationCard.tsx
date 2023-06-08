import { StaticImageData } from 'next/image'
import Link from 'next/link'
import { Typography } from '../common/Typography/Typography'

const IntegrationCard = ({
	name,
	description,
	link,
	image,
}: {
	name: string
	description: string
	link: string
	image?: StaticImageData
}) => {
	return (
		<Link
			href={link}
			className="flex gap-4 p-4 border-[1px] border-divider-on-dark rounded-lg hover:border-darker-copy-on-dark transition-all"
		>
			{/* <Image src={image} alt="logo" height="100" width="100" /> */}
			<div className="bg-slate-300 h-[50px] w-[50px] rounded-md flex-shrink-0"></div>
			<div className="flex flex-col gap-1">
				<Typography
					type="copy1"
					emphasis
					className="text-color-copy-on-dark"
				>
					{name}
				</Typography>
				<Typography
					type="copy3"
					className="text-color-darker-copy-on-dark"
				>
					{description}
				</Typography>
			</div>
		</Link>
	)
}

export default IntegrationCard
