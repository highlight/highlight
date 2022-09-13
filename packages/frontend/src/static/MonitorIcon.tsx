import * as React from 'react'

function SvgMonitorIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M4.75 6.75a2 2 0 012-2h10.5a2 2 0 012 2v7.5a2 2 0 01-2 2H6.75a2 2 0 01-2-2v-7.5zM15.25 19.25l-3.25-2-3.25 2"
			/>
		</svg>
	)
}

export default SvgMonitorIcon
