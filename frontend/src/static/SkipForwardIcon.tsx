import * as React from 'react'

function SvgSkipForwardIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M14.25 12l-8.5-6.25v12.5l8.5-6.25zM18.25 5.75v12.5"
			/>
		</svg>
	)
}

export default SvgSkipForwardIcon
