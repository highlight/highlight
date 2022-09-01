import * as React from 'react'

function SvgMapIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M4.75 6.75l4.5-2v12.5l-4.5 2V6.75zM14.75 6.75l4.5-2v12.5l-4.5 2V6.75zM14.75 6.75l-5.5-2v12.5l5.5 2V6.75z"
			/>
		</svg>
	)
}

export default SvgMapIcon
