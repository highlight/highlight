import * as React from 'react'

function SvgDown(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 64 64"
			fill="current"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M46.4 24.5L32 34.4l-14.4-9.9c-1.3-.8-2.9-.5-3.7.8-.8 1.3-.5 2.9.8 3.7l15.5 10.7c.5.3 1.3.5 1.9.5.8 0 1.3-.3 1.9-.5L49.5 29c1.3-.8 1.6-2.4.8-3.7-1-1.3-2.6-1.6-3.9-.8z" />
			<path d="M32 0C14.4 0 0 14.4 0 32s14.4 32 32 32 32-14.4 32-32S49.6 0 32 0zm0 58.7c-14.7 0-26.7-12-26.7-26.7S17.3 5.3 32 5.3s26.7 12 26.7 26.7-12 26.7-26.7 26.7z" />
		</svg>
	)
}

export default SvgDown
