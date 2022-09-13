import * as React from 'react'

function SvgPauseIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M15.25 6.75v10.5M8.75 6.75v10.5"
			/>
		</svg>
	)
}

export default SvgPauseIcon
