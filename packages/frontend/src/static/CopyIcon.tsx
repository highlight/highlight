import * as React from 'react'

function SvgCopyIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M6.5 15.25v0a1.75 1.75 0 01-1.75-1.75V6.75a2 2 0 012-2h6.75c.966 0 1.75.784 1.75 1.75v0"
			/>
			<rect
				width={10.5}
				height={10.5}
				x={8.75}
				y={8.75}
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				rx={2}
			/>
		</svg>
	)
}

export default SvgCopyIcon
