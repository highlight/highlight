import * as React from 'react'

function SvgArrowRight(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 64 28"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M62.6 10.3l-7.5-8.8C54 .4 52.4.2 51.4 1.2c-1.1 1.1-1.3 2.7-.3 3.7l5.3 6.4H2.7C1.1 11.3 0 12.4 0 14s1.1 2.7 2.7 2.7h53.8l-5.3 6.4c-1.1 1.1-.8 2.9.3 3.7.5.5 1.1.5 1.6.5.8 0 1.6-.3 2.1-1.1l7.5-8.8c1.8-1.7 1.8-4.9-.1-7.1z"
				fill="#5629C6"
			/>
		</svg>
	)
}

export default SvgArrowRight
