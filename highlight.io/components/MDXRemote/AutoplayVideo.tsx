interface Props extends React.VideoHTMLAttributes<HTMLVideoElement> {
	description: string
}

export function AutoplayVideo({
	description,
	src,
	autoPlay = true,
	muted = true,
	loop = true,
	...props
}: Props) {
	return (
		<a href={src} target="__blank" rel="noopener noreferrer">
			<video
				aria-label={description}
				autoPlay={autoPlay}
				muted={muted}
				loop={loop}
				src={src}
				{...props}
			/>
		</a>
	)
}
