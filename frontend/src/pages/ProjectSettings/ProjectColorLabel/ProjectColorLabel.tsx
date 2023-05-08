import { generateRandomColor } from '@/util/color'

export const ProjectColorLabel = ({
	size,
	seed,
}: {
	size: number
	seed: string
}) => {
	return (
		<div
			style={{
				backgroundColor: generateRandomColor(seed),
				height: size,
				width: size,
				margin: size / 2,
				borderRadius: size,
			}}
		></div>
	)
}
