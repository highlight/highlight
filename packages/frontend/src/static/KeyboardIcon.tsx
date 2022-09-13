import * as React from 'react'

function SvgKeyboardIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M4.75 6.75v10.5a2 2 0 002 2h10.5a2 2 0 002-2V6.75a2 2 0 00-2-2H6.75a2 2 0 00-2 2z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M8.5 8a.5.5 0 11-1 0 .5.5 0 011 0zM8.5 12a.5.5 0 11-1 0 .5.5 0 011 0zM12.5 8a.5.5 0 11-1 0 .5.5 0 011 0zM12.5 12a.5.5 0 11-1 0 .5.5 0 011 0zM16.5 8a.5.5 0 11-1 0 .5.5 0 011 0zM16.5 12a.5.5 0 11-1 0 .5.5 0 011 0z"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M7.75 16.25h8.5"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgKeyboardIcon
