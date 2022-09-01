import * as React from 'react'

function SvgMessageIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="3 9 12 1"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M9 13.688c2.625 0 5.438-1.313 5.438-4.688S11.624 4.312 9 4.312C6.375 4.313 3.562 5.625 3.562 9c0 .772.148 1.437.406 2.002.162.352.252.741.18 1.122l-.196 1.049a.75.75 0 00.875.875l2.406-.451a1.68 1.68 0 01.573-.002c.395.062.797.092 1.194.092z"
				stroke="currentColor"
				strokeWidth={1.125}
			/>
			<path
				d="M7.125 9a.375.375 0 11-.75 0 .375.375 0 01.75 0zM9.375 9a.375.375 0 11-.75 0 .375.375 0 01.75 0zM11.625 9a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
				stroke="currentColor"
				strokeWidth={0.75}
			/>
		</svg>
	)
}

export default SvgMessageIcon
