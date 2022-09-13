import * as React from 'react'

function SvgPlusIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M12 5.75v12.5M18.25 12H5.75"
			/>
		</svg>
	)
}

export default SvgPlusIcon
