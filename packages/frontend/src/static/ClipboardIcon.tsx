import * as React from 'react'

function SvgClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M9 6.75H7.75a2 2 0 00-2 2v8.5a2 2 0 002 2h8.5a2 2 0 002-2v-8.5a2 2 0 00-2-2H15"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M14 8.25h-4a1 1 0 01-1-1v-1.5a1 1 0 011-1h4a1 1 0 011 1v1.5a1 1 0 01-1 1zM9.75 12.25h4.5M9.75 15.25h4.5"
			/>
		</svg>
	)
}

export default SvgClipboardIcon
