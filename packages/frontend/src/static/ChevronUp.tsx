import * as React from 'react'

function SvgChevronUp(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 14 8"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M7 .478c.284 0 .525.11.766.284l6.059 5.71c.24.24.24.59 0 .81-.24.24-.59.24-.81 0L7 1.637.984 7.346c-.24.24-.59.24-.81 0-.24-.24-.24-.59 0-.81L6.235.829c.24-.306.482-.35.766-.35z"
				fill="current"
			/>
		</svg>
	)
}

export default SvgChevronUp
