import * as React from 'react'

function SvgCarDashboardIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M19.25 12a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M16.075 17.79C15.5 16.5 13.656 15.75 12 15.75c-1.656 0-3.5.75-4.075 2.04M11.75 12.25l2.5-2.5"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgCarDashboardIcon
