import * as React from 'react'

function SvgBanner(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 228 9"
			fill="current"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M51.089 9H114V.6H11.8a36 36 0 0113.887 2.808l2.168.91A60 60 0 0051.089 9zM176.911 9H114V.6h102.2c-4.769.007-9.49.961-13.887 2.808l-2.168.91A59.998 59.998 0 01176.911 9z" />
		</svg>
	)
}

export default SvgBanner
