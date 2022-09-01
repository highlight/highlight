import * as React from 'react'

function SvgCursorClickIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M8.75 8.75L13 19.25l1.25-5 5-1.25-10.5-4.25zM15 15l4.25 4.25M4.75 4.75l1.5 1.5M13.25 4.75l-1.5 1.5M17.75 17.75l1.5 1.5M6.25 11.75l-1.5 1.5"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgCursorClickIcon
