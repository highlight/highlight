import * as React from 'react'

function SvgSwitch2Icon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M8.25 11.25L4.75 8l3.5-3.25M4.75 8h10.5M15.75 12.75l3.5 3.25-3.5 3.25M19.25 16H8.75"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgSwitch2Icon
