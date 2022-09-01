import * as React from 'react'

function SvgPlugIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M18.281 12.031L11.97 5.72a1 1 0 00-1.596.249L6.75 13 11 17.25l7.032-3.623a1 1 0 00.25-1.596zM4.75 19.25L8.5 15.5M13.75 7.25l2.5-2.5M16.75 10.25l2.5-2.5"
			/>
		</svg>
	)
}

export default SvgPlugIcon
