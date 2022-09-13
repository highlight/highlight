import * as React from 'react'

function SvgSearchIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M19.25 19.25L15.5 15.5M4.75 11a6.25 6.25 0 1112.5 0 6.25 6.25 0 01-12.5 0z"
			/>
		</svg>
	)
}

export default SvgSearchIcon
