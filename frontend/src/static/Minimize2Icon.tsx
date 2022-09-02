import * as React from 'react'

function SvgMinimize2Icon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M10.25 18.25v-4.5h-4.5M13.75 5.75v4.5h4.5M4.75 19.25l5.5-5.5M19.25 4.75l-5.5 5.5"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgMinimize2Icon
