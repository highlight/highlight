import * as React from 'react'

function SvgLinkedIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M11 14.25h1.5a4.75 4.75 0 100-9.5H9A4.25 4.25 0 004.75 9v1.25"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M13 9.75h-1.5a4.75 4.75 0 100 9.5H15A4.25 4.25 0 0019.25 15v-1.25"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgLinkedIcon
