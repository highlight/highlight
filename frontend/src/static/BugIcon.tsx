import * as React from 'react'

function SvgBugIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M7.75 13a4.25 4.25 0 018.5 0v2a4.25 4.25 0 01-8.5 0v-2zM12 9v10M8.75 6.383c0-.902.731-1.633 1.633-1.633h3.234c.902 0 1.633.731 1.633 1.633 0 1.031-.836 1.867-1.867 1.867h-2.766A1.867 1.867 0 018.75 6.383zM7.5 14.75l-1.433.521a2 2 0 00-1.317 1.88v2.099"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M8 11L5.802 9.816a2 2 0 01-1.052-1.76V5.75M16.5 14.75l1.433.521a2 2 0 011.317 1.88v2.099M16 11l2.198-1.184a2 2 0 001.052-1.76V5.75"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgBugIcon
