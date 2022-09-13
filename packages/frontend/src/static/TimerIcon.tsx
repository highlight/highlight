import * as React from 'react'

function SvgTimerIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M18.25 13a6.25 6.25 0 11-12.5 0 6.25 6.25 0 0112.5 0zM16.5 8.5l.75-.75M12 6.5V4.75m0 0H9.75m2.25 0h2.25M12 9.75v3.5"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgTimerIcon
