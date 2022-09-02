import * as React from 'react'

function SvgAppsIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M4.75 6.75v1.5a2 2 0 002 2h1.5a2 2 0 002-2v-1.5a2 2 0 00-2-2h-1.5a2 2 0 00-2 2zM14.75 7h4.5M17 4.75v4.5M4.75 15.75v1.5a2 2 0 002 2h1.5a2 2 0 002-2v-1.5a2 2 0 00-2-2h-1.5a2 2 0 00-2 2zM13.75 15.75v1.5a2 2 0 002 2h1.5a2 2 0 002-2v-1.5a2 2 0 00-2-2h-1.5a2 2 0 00-2 2z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgAppsIcon
