import * as React from 'react'

function SvgDimensionsIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="4 4 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M10.75 12.75a2 2 0 012-2h4.5a2 2 0 012 2v4.5a2 2 0 01-2 2h-4.5a2 2 0 01-2-2v-4.5zM4.75 9.25L6 7.75l1.25 1.5M11.25 7.25L10 6l1.25-1.25M18 7.25L19.25 6 18 4.75M4.75 17.75L6 19.25l1.25-1.5M6 18.5v-10M19 6h-8"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgDimensionsIcon
