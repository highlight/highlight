import * as React from 'react'

function SvgFileText2Icon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M12.75 4.75h-5a2 2 0 00-2 2v10.5a2 2 0 002 2h8.5a2 2 0 002-2v-7m-5.5-5.5v3.5a2 2 0 002 2h3.5m-5.5-5.5l5.5 5.5M8.75 15.75h6.5M8.75 12.75h2.5"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgFileText2Icon
