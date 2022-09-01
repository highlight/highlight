import * as React from 'react'

function SvgFaceIdIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M9.25 4.75h-.5a4 4 0 00-4 4v.5M9.25 19.25h-.5a4 4 0 01-4-4v-.5M14.75 4.75h.5a4 4 0 014 4v.5M14.75 19.25h.5a4 4 0 004-4v-.5"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M10.5 10a.5.5 0 11-1 0 .5.5 0 011 0zM14.5 10a.5.5 0 11-1 0 .5.5 0 011 0z"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M8.75 12.75s.25 2.5 3.25 2.5 3.25-2.5 3.25-2.5"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgFaceIdIcon
