import * as React from 'react'

function SvgArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M13.75 6.75l5.5 5.25-5.5 5.25M19 12H4.75"
			/>
		</svg>
	)
}

export default SvgArrowRightIcon
