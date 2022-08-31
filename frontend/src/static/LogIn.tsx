import * as React from 'react'

function SvgLogIn(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M9.75 8.75l3.5 3.25-3.5 3.25"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M9.75 4.75h7.5a2 2 0 012 2v10.5a2 2 0 01-2 2h-7.5M13 12H4.75"
			/>
		</svg>
	)
}

export default SvgLogIn
