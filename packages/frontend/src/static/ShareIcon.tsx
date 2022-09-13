import * as React from 'react'

function SvgShareIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M9.25 4.75h-2.5a2 2 0 00-2 2v10.5a2 2 0 002 2h10.5a2 2 0 002-2v-2.5M19.25 9.25v-4.5h-4.5M19 5l-7.25 7.25"
			/>
		</svg>
	)
}

export default SvgShareIcon
