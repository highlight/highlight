import * as React from 'react'

function SvgMaximizeIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M4.75 14.75v2.5a2 2 0 002 2h2.5M19.25 14.75v2.5a2 2 0 01-2 2h-2.5M19.25 9.25v-2.5a2 2 0 00-2-2h-2.5M4.75 9.25v-2.5a2 2 0 012-2h2.5"
			/>
		</svg>
	)
}

export default SvgMaximizeIcon
