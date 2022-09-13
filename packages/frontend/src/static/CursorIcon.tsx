import * as React from 'react'

function SvgCursorIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M5.75 5.75L11 18.25 13 13l5.25-2-12.5-5.25zM13 13l5.25 5.25"
			/>
		</svg>
	)
}

export default SvgCursorIcon
