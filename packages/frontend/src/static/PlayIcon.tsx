import * as React from 'react'

function SvgPlayIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M18.25 12L5.75 5.75v12.5L18.25 12z"
			/>
		</svg>
	)
}

export default SvgPlayIcon
