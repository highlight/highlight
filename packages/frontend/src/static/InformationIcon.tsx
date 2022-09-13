import * as React from 'react'

function SvgInformationIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			fill="none"
			viewBox="0 0 24 24"
			{...props}
		>
			<path
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M12 13v2"
			/>
			<circle cx={12} cy={9} r={1} fill="currentColor" />
			<circle
				cx={12}
				cy={12}
				r={7.25}
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
			/>
		</svg>
	)
}

export default SvgInformationIcon
