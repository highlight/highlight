import * as React from 'react'

function SvgCloseIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M17.25 6.75l-10.5 10.5M6.75 6.75l10.5 10.5"
			/>
		</svg>
	)
}

export default SvgCloseIcon
