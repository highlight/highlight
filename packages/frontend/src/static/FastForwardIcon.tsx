import * as React from 'react'

function SvgFastForwardIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M8 15.86l-3.25 2.39V5.75L8 8.14M19.25 12l-8.5-6.25v12.5l8.5-6.25z"
			/>
		</svg>
	)
}

export default SvgFastForwardIcon
