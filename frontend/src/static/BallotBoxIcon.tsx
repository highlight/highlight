import * as React from 'react'

function SvgBallotBoxIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M16.75 4.75h.642a1 1 0 01.989.848l.869 5.652H4.75l.87-5.652a1 1 0 01.988-.848h.642M4.75 11.25h14.5v6a2 2 0 01-2 2H6.75a2 2 0 01-2-2v-6z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M9.75 8.25h4.5m-4.5 0v-2.5a1 1 0 011-1h2.5a1 1 0 011 1v2.5m-4.5 0h-2m6.5 0h2"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgBallotBoxIcon
