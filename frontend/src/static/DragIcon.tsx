import * as React from 'react'

function SvgDragIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="4 4 8 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M12.5 6a.5.5 0 11-1 0 .5.5 0 011 0zM12.5 12a.5.5 0 11-1 0 .5.5 0 011 0zM6.5 6a.5.5 0 11-1 0 .5.5 0 011 0zM6.5 12a.5.5 0 11-1 0 .5.5 0 011 0zM12.5 18a.5.5 0 11-1 0 .5.5 0 011 0zM6.5 18a.5.5 0 11-1 0 .5.5 0 011 0z"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgDragIcon
