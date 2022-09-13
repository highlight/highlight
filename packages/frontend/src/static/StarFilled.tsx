import * as React from 'react'

function SvgStarFilled(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 64 64"
			width="1em"
			height="1em"
			{...props}
		>
			<path d="M62.7 23.2l-20-3.2-9-18.9c-.5-1.3-2.4-1.3-2.9 0L21.4 20l-20 2.9c-1.3.3-2.1 2.1-.8 3.2L15.1 41l-3.5 20.8c-.3 1.3 1.1 2.7 2.7 1.9l17.8-9.8 17.8 9.8c1.1.8 2.7-.5 2.4-1.9L48.9 41l14.4-14.9c1.3-1 .7-2.9-.6-2.9z" />
		</svg>
	)
}

export default SvgStarFilled
