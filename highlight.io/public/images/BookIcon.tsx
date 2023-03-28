import * as React from 'react'

function SvgBookIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M19.25 5.75a1 1 0 00-1-1H14a2 2 0 00-2 2v12.5l.828-.828a4 4 0 012.829-1.172h2.593a1 1 0 001-1V5.75zM4.75 5.75a1 1 0 011-1H10a2 2 0 012 2v12.5l-.828-.828a4 4 0 00-2.829-1.172H5.75a1 1 0 01-1-1V5.75z"
			/>
		</svg>
	)
}

export default SvgBookIcon
