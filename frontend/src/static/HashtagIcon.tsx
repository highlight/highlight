import * as React from 'react'

function SvgHashtagIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M10.25 4.75l-2.5 14.5M16.25 4.75l-2.5 14.5M19.25 8.75H5.75M18.25 15.25H4.75"
			/>
		</svg>
	)
}

export default SvgHashtagIcon
