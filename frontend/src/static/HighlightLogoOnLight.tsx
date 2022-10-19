import * as React from 'react'

function SvgHighlightLogoOnLight(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="19"
			height="20"
			viewBox="0 0 19 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<circle cx="9.5" cy="10" r="9.5" fill="#6C37F4" />
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M6.53125 5.84375C5.87541 5.84375 5.34375 6.37541 5.34375 7.03125V12.9688C5.34375 13.6246 5.87541 14.1562 6.53125 14.1562H10.0938L7.125 5.84375H6.53125ZM8.90625 5.84375L11.875 14.1562H12.4688C13.1246 14.1562 13.6562 13.6246 13.6562 12.9688V7.03125C13.6562 6.37541 13.1246 5.84375 12.4688 5.84375H8.90625Z"
				fill="white"
			/>
		</svg>
	)
}

export default SvgHighlightLogoOnLight
