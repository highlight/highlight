import * as React from 'react'

function SvgFilterIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M19.25 4.75H4.75l4.562 5.702a2 2 0 01.438 1.25v6.548a1 1 0 001 1h2.5a1 1 0 001-1v-6.548a2 2 0 01.438-1.25L19.25 4.75z"
			/>
		</svg>
	)
}

export default SvgFilterIcon
