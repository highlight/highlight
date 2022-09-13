import * as React from 'react'

function SvgSessionsIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 18 18"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<g clipPath="url(#sessions-icon_svg__clip0)">
				<path
					d="M15.92 7.847L3.6.197c-.45-.225-.984-.31-1.35 0-.45.14-.759.59-.759 1.125v15.384c0 .45.31.9.675 1.125.225.085.45.14.675.14.225 0 .535-.084.76-.224l12.318-7.622c.366-.225.591-.675.591-1.125 0-.45-.225-.928-.59-1.153zM2.981 16.34V1.631L14.85 9 2.98 16.34z"
					fill="current"
				/>
			</g>
			<defs>
				<clipPath id="sessions-icon_svg__clip0">
					<path d="M0 0h18v18H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default SvgSessionsIcon
