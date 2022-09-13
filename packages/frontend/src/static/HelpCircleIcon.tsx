import * as React from 'react'

function SvgHelpCircleIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M19.25 12a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M9.75 10S10 7.75 12 7.75 14.25 9 14.25 10c0 .751-.423 1.503-1.27 1.83-.515.199-.98.618-.98 1.17v.25"
			/>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12.5 16a.5.5 0 11-1 0 .5.5 0 011 0z"
			/>
		</svg>
	)
}

export default SvgHelpCircleIcon
