import * as React from 'react'

function SvgShare2Icon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M19.25 7a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM9.25 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM19.25 17a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM14.5 16L9 13.5M14.5 8.5L9 11"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgShare2Icon
