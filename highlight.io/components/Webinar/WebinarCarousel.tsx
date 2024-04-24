import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { Typography } from '../common/Typography/Typography'
import { WEBINARS } from './webinar'

export const WebinarCarousel = () => {
	const [emblaRef] = useEmblaCarousel()

	return (
		<div className="overflow-hidden max-w-[950px] border" ref={emblaRef}>
			<div className="flex justify-center items-center my-8 pl-1">
				{WEBINARS.map((webinar, id) => (
					<div
						key={id}
						className="flex flex-col items-start flex-shrink-0 flex-grow-0 w-1/3"
					>
						<div className="relative h-[180px] w-[300px] bg-copy-on-dark rounded-md overflow-hidden">
							<Image
								src={webinar.image || ''}
								alt="Webinar Thumbnail"
								className="absolute h-[180px] w-auto mx-auto"
								layout="fill"
							/>
						</div>
						<Typography
							type="copy2"
							className="text-start"
							emphasis
						>
							{webinar.title}
						</Typography>
					</div>
				))}
			</div>
		</div>
	)
}
