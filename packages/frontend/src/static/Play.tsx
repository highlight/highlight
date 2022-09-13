import * as React from 'react'

function SvgPlay(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 54 64"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M51.6 27.9L7.8.7C6.2-.1 4.3-.4 3 .7 1.4 1.2.3 2.8.3 4.7v54.7c0 1.6 1.1 3.2 2.4 4 .8.3 1.6.5 2.4.5.8 0 1.9-.3 2.7-.8L51.6 36c1.3-.8 2.1-2.4 2.1-4s-.8-3.3-2.1-4.1zm-46 30.2V5.8L47.8 32 5.6 58.1z" />
		</svg>
	)
}

export default SvgPlay
