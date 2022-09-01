import * as React from 'react'

function SvgHighlightLogoWithNoBackground(
	props: React.SVGProps<SVGSVGElement>,
) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 183 183"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M68.345 51.286l-10.023.032a7.231 7.231 0 00-7.208 7.254l.205 65.373a7.232 7.232 0 007.253 7.209l36.357-.114-26.584-79.754zM114.487 130.978L86.575 51.229l37.121-.116a7.23 7.23 0 017.253 7.208l.205 65.374a7.231 7.231 0 01-7.208 7.254l-9.459.029z"
				fill="#fff"
			/>
		</svg>
	)
}

export default SvgHighlightLogoWithNoBackground
