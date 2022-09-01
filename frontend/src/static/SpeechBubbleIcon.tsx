import * as React from 'react'

function SvgSpeechBubbleIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="4 4 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M12 18.25c3.866 0 7.25-2.095 7.25-6.75 0-4.655-3.384-6.75-7.25-6.75S4.75 6.845 4.75 11.5c0 1.768.488 3.166 1.305 4.22.239.31.334.72.168 1.073-.1.215-.207.42-.315.615-.454.816.172 2.005 1.087 1.822 1.016-.204 2.153-.508 3.1-.956.198-.094.418-.13.635-.103.415.053.84.079 1.27.079z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgSpeechBubbleIcon
