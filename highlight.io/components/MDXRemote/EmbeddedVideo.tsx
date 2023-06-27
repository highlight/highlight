export function EmbeddedVideo(props: {
	title: string
	src: string
	allowString?: string
}) {
	return (
		<div className="overflow-hidden my-3 border-[2px] border-[#30294e] rounded-[8px] aspect-video">
			<iframe
				className="w-full h-full"
				src={props.src}
				title={props.title}
				allow={props.allowString || ''}
			></iframe>
		</div>
	)
}
