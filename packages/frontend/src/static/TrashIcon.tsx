import * as React from 'react'

function SvgTrashIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M6.75 7.75l.841 9.673a2 2 0 001.993 1.827h4.832a2 2 0 001.993-1.827l.841-9.673M9.75 7.5v-.75a2 2 0 012-2h.5a2 2 0 012 2v.75M5 7.75h14"
			/>
		</svg>
	)
}

export default SvgTrashIcon
