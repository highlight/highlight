import Image from 'next/image'
import Link from 'next/link'

const IntegrationCard = ({
	name,
	description,
	link,
	image,
}: {
	name: string
	description: string
	link: string
	image?: string
}) => {
	return (
		<Link
			href={link}
			className="group flex flex-col gap-3 p-5 bg-[#1A0E35] border border-[#2D1B69] rounded-xl hover:border-[#6C47FF] hover:bg-[#1F1240] transition-all duration-200 hover:shadow-lg hover:shadow-[#6C47FF]/10"
		>
			<div className="flex items-center gap-3">
				{image ? (
					<div className="w-10 h-10 relative flex-shrink-0 bg-white/5 rounded-lg flex items-center justify-center p-1.5">
						<Image
							src={image}
							alt={`${name} logo`}
							width={32}
							height={32}
							className="object-contain"
						/>
					</div>
				) : (
					<div className="w-10 h-10 flex-shrink-0 bg-[#6C47FF]/20 rounded-lg flex items-center justify-center">
						<span className="text-[#6C47FF] font-bold text-sm">
							{name[0]}
						</span>
					</div>
				)}
				<h3 className="font-semibold text-white group-hover:text-[#C4B5FD] transition-colors">
					{name}
				</h3>
			</div>
			<p className="text-sm text-[#9B8EC4] leading-relaxed line-clamp-2">
				{description}
			</p>
			<div className="flex items-center gap-1 text-xs text-[#6C47FF] font-medium mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
				<span>View docs</span>
				<svg
					className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M9 5l7 7-7 7"
					/>
				</svg>
			</div>
		</Link>
	)
}

export default IntegrationCard
