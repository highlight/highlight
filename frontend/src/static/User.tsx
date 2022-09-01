import * as React from 'react'

function SvgUser(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<g clipPath="url(#user_svg__clip0)" fill="current">
				<path d="M8.025 9.325c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm0-6.65A2.678 2.678 0 005.35 5.35C5.35 6.825 6.575 8 8.025 8 9.475 8 10.7 6.8 10.7 5.325c0-1.475-1.2-2.65-2.675-2.65zM.701 14.675c-.2 0-.4-.075-.525-.275-.275-.275-.2-.725.075-.925 2.2-1.8 4.925-2.8 7.8-2.8s5.6 1 7.725 2.8c.275.275.325.675.075.925-.275.275-.675.325-.925.075-1.9-1.6-4.35-2.475-6.9-2.475-2.55 0-5 .875-6.925 2.525a.709.709 0 01-.4.15z" />
			</g>
			<defs>
				<clipPath id="user_svg__clip0">
					<path fill="#fff" d="M0 0h16v16H0z" />
				</clipPath>
			</defs>
		</svg>
	)
}

export default SvgUser
