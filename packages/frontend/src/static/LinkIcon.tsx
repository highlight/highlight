import * as React from 'react'

function SvgLinkIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M16.75 13.25L18 12a4.243 4.243 0 000-6v0a4.243 4.243 0 00-6 0l-1.25 1.25M7.25 10.75L6 12a4.243 4.243 0 000 6v0a4.243 4.243 0 006 0l1.25-1.25M14.25 9.75l-4.5 4.5"
			/>
		</svg>
	)
}

export default SvgLinkIcon
