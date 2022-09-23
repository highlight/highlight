import * as React from 'react'

function SvgHighlightLogoWithNoBackground(
	props: React.SVGProps<SVGSVGElement>,
) {
	return (
		<svg
			width="40"
			height="40"
			viewBox="0 0 40 40"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M15 13C13.8954 13 13 13.8954 13 15V25C13 26.1046 13.8954 27 15 27H21L16 13H15ZM19 13L24 27H25C26.1046 27 27 26.1046 27 25V15C27 13.8954 26.1046 13 25 13H19Z"
				fill="white"
			/>
		</svg>
	)
}

export default SvgHighlightLogoWithNoBackground
