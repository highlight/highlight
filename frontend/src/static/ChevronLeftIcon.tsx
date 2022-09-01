import * as React from 'react'

function SvgChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M13.25 8.75L9.75 12l3.5 3.25"
			/>
		</svg>
	)
}

export default SvgChevronLeftIcon
