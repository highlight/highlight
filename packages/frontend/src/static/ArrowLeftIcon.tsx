import * as React from 'react'

function SvgArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M10.25 6.75L4.75 12l5.5 5.25M19.25 12H5"
			/>
		</svg>
	)
}

export default SvgArrowLeftIcon
