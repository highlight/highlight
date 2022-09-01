import * as React from 'react'

function SvgQuoteIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M4.75 6.75a2 2 0 012-2h2.5a2 2 0 012 2v2.187a3 3 0 01-.965 2.204L8 13.25v-3H6.75a2 2 0 01-2-2v-1.5zM12.75 12.75a2 2 0 012-2h2.5a2 2 0 012 2v2.187a3 3 0 01-.965 2.204L16 19.25v-3h-1.25a2 2 0 01-2-2v-1.5z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgQuoteIcon
