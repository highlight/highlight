import * as React from 'react'

function SvgEyeOffIcon(props: React.SVGProps<SVGSVGElement>) {
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
				d="M18.625 10c.44.899.625 1.675.625 2 0 1-1.75 6.25-7.25 6.25a7.621 7.621 0 01-2-.256m-3-1.725C5.362 14.669 4.75 12.59 4.75 12c0-1 1.75-6.25 7.25-6.25 1.795 0 3.19.559 4.256 1.347M19.25 4.75l-14.5 14.5M10.409 13.591a2.25 2.25 0 013.182-3.182"
			/>
		</svg>
	)
}

export default SvgEyeOffIcon
