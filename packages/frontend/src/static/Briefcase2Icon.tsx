import * as React from 'react'

function SvgBriefcase2Icon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M4.75 9.75a2 2 0 012-2h10.5a2 2 0 012 2v7.5a2 2 0 01-2 2H6.75a2 2 0 01-2-2v-7.5z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M8.75 18.75v-12a2 2 0 012-2h2.5a2 2 0 012 2v12"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgBriefcase2Icon
