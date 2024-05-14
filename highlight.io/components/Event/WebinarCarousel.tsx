import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { Typography } from '../common/Typography/Typography'
import { EVENTS } from './events'

export const WebinarCarousel = () => {
	const [emblaRef] = useEmblaCarousel()

	return (
		<div className="overflow-hidden max-w-[950px] border" ref={emblaRef}>
			<div className="flex justify-center items-center my-8 pl-1 gap-4">
				{Object.entries(EVENTS).map(([id, event]) => (
					<div
						key={id}
						className="flex flex-col items-start flex-shrink-0 flex-grow-0  overflow-hidden"
					>
						<div className="relative h-[180px] w-[300px] bg-copy-on-dark rounded-md overflow-hidden">
							<Image
								src={event.image || ''}
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
							{event.title}
						</Typography>
					</div>
				))}
			</div>
		</div>
	)
}
