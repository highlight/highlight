import React from 'react'

import { IconProps } from './types'

export const IconSolidClickUp = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 20 20"
			focusable="false"
			{...props}
		>
			<path
				fill="#fff"
				stroke="#DCDBDD"
				strokeWidth={0.6}
				d="M5.32 1.3h9.36c2.22 0 4.02 1.8 4.02 4.02v9.36c0 2.22-1.8 4.02-4.02 4.02H5.32a4.02 4.02 0 0 1-4.02-4.02V5.32C1.3 3.1 3.1 1.3 5.32 1.3Z"
			/>
			<path
				fill="url(#paint0_linear_590_7245)"
				fillRule="evenodd"
				d="m4.727 13.343 1.946-1.491c1.034 1.35 2.132 1.971 3.355 1.971 1.217 0 2.284-.614 3.272-1.953l1.973 1.455c-1.424 1.93-3.195 2.95-5.245 2.95-2.043 0-3.831-1.012-5.301-2.932Z"
				clipRule="evenodd"
			/>
			<path
				fill="url(#paint1_linear_590_7245)"
				fillRule="evenodd"
				d="M10.021 6.862 6.557 9.847 4.956 7.99l5.072-4.37 5.033 4.373-1.608 1.851-3.431-2.982Z"
				clipRule="evenodd"
			/>
			<defs>
				<linearGradient
					id="paint0_linear_590_7245"
					x1={4.727}
					x2={15.273}
					y1={14.86}
					y2={14.86}
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#8930FD" />
					<stop offset={1} stopColor="#49CCF9" />
				</linearGradient>
				<linearGradient
					id="paint1_linear_590_7245"
					x1={4.956}
					x2={15.061}
					y1={7.855}
					y2={7.855}
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#FF02F0" />
					<stop offset={1} stopColor="#FFC800" />
				</linearGradient>
			</defs>
		</svg>
	)
}
