import * as React from 'react'

function SvgAnnotationDotsIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M4.75 6.75a2 2 0 012-2h10.5a2 2 0 012 2v7.5a2 2 0 01-2 2h-2.625l-2.625 3-2.625-3H6.75a2 2 0 01-2-2v-7.5z"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9.5 11a.5.5 0 11-1 0 .5.5 0 011 0zM12.5 11a.5.5 0 11-1 0 .5.5 0 011 0zM15.5 11a.5.5 0 11-1 0 .5.5 0 011 0z"
			/>
		</svg>
	)
}

export default SvgAnnotationDotsIcon
