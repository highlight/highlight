import * as React from 'react'

function SvgEditIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M4.75 19.25l4.25-1 9.293-9.293a1 1 0 000-1.414l-1.836-1.836a1 1 0 00-1.414 0L5.75 15l-1 4.25zM19.25 19.25h-5.5"
			/>
		</svg>
	)
}

export default SvgEditIcon
