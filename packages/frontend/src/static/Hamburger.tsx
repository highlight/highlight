import * as React from 'react'

function SvgHamburger(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 64 44"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M61.3 19.3H2.7C1.1 19.3 0 20.4 0 22s1.1 2.7 2.7 2.7h58.7c1.6 0 2.7-1.1 2.7-2.7-.1-1.6-1.2-2.7-2.8-2.7zM61.3 38H2.7C1.1 38 0 39.1 0 40.7s1.1 2.7 2.7 2.7h58.7c1.6 0 2.7-1.1 2.7-2.7-.1-1.6-1.2-2.7-2.8-2.7zM2.7 6h58.7c1.6 0 2.7-1.1 2.7-2.7S63 .6 61.4.6H2.7C1.1.6 0 1.7 0 3.3S1.1 6 2.7 6z"
				fill="#000"
			/>
		</svg>
	)
}

export default SvgHamburger
