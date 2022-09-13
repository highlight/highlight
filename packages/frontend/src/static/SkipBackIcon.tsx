import * as React from 'react'

function SvgSkipBackIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M9.75 12l8.5-6.25v12.5L9.75 12zM5.75 5.75v12.5"
			/>
		</svg>
	)
}

export default SvgSkipBackIcon
