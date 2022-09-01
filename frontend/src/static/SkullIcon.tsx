import * as React from 'react'

function SvgSkullIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M4.75 12a7.25 7.25 0 0114.5 0v1.25a2 2 0 01-2 2h-1v3a1 1 0 01-1 1h-6.5a1 1 0 01-1-1v-3h-1a2 2 0 01-2-2V12z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M16.25 11a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM10.25 11a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0zM10.75 17.75v1.5M13.25 17.75v1.5"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgSkullIcon
