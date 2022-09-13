import * as React from 'react'

function SvgPinTackIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M8.75 7.75l-1-3h8.5l-1 3V10c3 1 3 4.25 3 4.25H5.75s0-3.25 3-4.25V7.75zM12 14.5v4.75"
			/>
		</svg>
	)
}

export default SvgPinTackIcon
