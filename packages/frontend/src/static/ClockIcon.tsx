import * as React from 'react'

function SvgClockIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			fill="none"
			viewBox="4 4 16 16"
			{...props}
		>
			<circle
				cx={12}
				cy={12}
				r={7.25}
				stroke="currentColor"
				strokeWidth={1.5}
			/>
			<path stroke="currentColor" strokeWidth={1.5} d="M12 8v4l2 2" />
		</svg>
	)
}

export default SvgClockIcon
