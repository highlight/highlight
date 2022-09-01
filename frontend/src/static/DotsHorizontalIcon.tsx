import * as React from 'react'

function SvgDotsHorizontalIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			fill="none"
			viewBox="4 4 16 16"
			{...props}
		>
			<path
				fill="currentColor"
				d="M13 12a1 1 0 11-2 0 1 1 0 012 0zM9 12a1 1 0 11-2 0 1 1 0 012 0zM17 12a1 1 0 11-2 0 1 1 0 012 0z"
			/>
		</svg>
	)
}

export default SvgDotsHorizontalIcon
