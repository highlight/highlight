import * as React from 'react'

function SvgDownloadIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M4.75 14.75v1.5a3 3 0 003 3h8.5a3 3 0 003-3v-1.5M12 14.25v-9.5M8.75 10.75l3.25 3.5 3.25-3.5"
			/>
		</svg>
	)
}

export default SvgDownloadIcon
