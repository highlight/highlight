import * as React from 'react'

function SvgRewindIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M16 15.86l3.25 2.39V5.75L16 8.14M4.75 12l8.5-6.25v12.5L4.75 12z"
			/>
		</svg>
	)
}

export default SvgRewindIcon
