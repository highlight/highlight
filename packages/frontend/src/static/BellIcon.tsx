import * as React from 'react'

function SvgBellIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M17.25 12v-2a5.25 5.25 0 10-10.5 0v2l-2 4.25h14.5l-2-4.25zM9 16.75s0 2.5 3 2.5 3-2.5 3-2.5"
			/>
		</svg>
	)
}

export default SvgBellIcon
