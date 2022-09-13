import * as React from 'react'

function SvgMouseIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M9 11.25v-3.5a3 3 0 013-3h1.75a3 3 0 013 3v9.5a2 2 0 002 2h.5"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M4.75 10.75a3 3 0 013-3h2.5a3 3 0 013 3v5.5a3 3 0 01-3 3h-2.5a3 3 0 01-3-3v-5.5z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgMouseIcon
