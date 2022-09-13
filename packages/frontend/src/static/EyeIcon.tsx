import * as React from 'react'

function SvgEyeIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M19.25 12c0 1-1.75 6.25-7.25 6.25S4.75 13 4.75 12 6.5 5.75 12 5.75 19.25 11 19.25 12z"
			/>
			<circle
				cx={12}
				cy={12}
				r={2.25}
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
			/>
		</svg>
	)
}

export default SvgEyeIcon
