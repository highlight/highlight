import * as React from 'react'

function SvgHomeIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			fill="none"
			viewBox="4 4 16 16"
			{...props}
		>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M6.75 19.25h10.5a2 2 0 002-2v-7.5l-7.25-5-7.25 5v7.5a2 2 0 002 2z"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M9.75 15.75a2 2 0 012-2h.5a2 2 0 012 2v3.5h-4.5v-3.5z"
			/>
		</svg>
	)
}

export default SvgHomeIcon
