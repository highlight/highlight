import React from 'react'

import { IconProps } from './types'

export const IconSolidJira = ({ size = '1em', ...props }: IconProps) => {
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
			<path d="M32 0H0V32H32V0Z" fill="#0052CC" />
			<path
				d="M23.7199 7.64001H15.6399C15.6399 9.64001 17.2799 11.28 19.2799 11.28H20.7599V12.72C20.7599 14.72 22.3999 16.36 24.3999 16.36V8.32001C24.4399 7.96001 24.1199 7.64001 23.7199 7.64001Z"
				fill="white"
			/>
			<path
				d="M19.7199 11.64H11.6399C11.6399 13.64 13.2799 15.28 15.2799 15.28H16.7599V16.72C16.7599 18.72 18.3999 20.36 20.3999 20.36V12.36C20.4399 11.96 20.1199 11.64 19.7199 11.64Z"
				fill="url(#paint0_linear)"
			/>
			<path
				d="M15.7199 15.6801H7.63989C7.63989 17.6801 9.27988 19.3201 11.2799 19.3201H12.7599V20.7601C12.7599 22.7601 14.3999 24.4001 16.3999 24.4001V16.4001C16.4399 16.0001 16.1199 15.6801 15.7199 15.6801Z"
				fill="url(#paint1_linear)"
			/>
			<defs>
				<linearGradient
					id="paint0_linear"
					x1="20.2597"
					y1="11.6708"
					x2="16.8183"
					y2="15.2196"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0.176" stopColor="white" stopOpacity="0.4" />
					<stop offset="1" stopColor="white" />
				</linearGradient>
				<linearGradient
					id="paint1_linear"
					x1="16.4844"
					y1="15.7246"
					x2="12.5054"
					y2="19.596"
					gradientUnits="userSpaceOnUse"
				>
					<stop offset="0.176" stopColor="white" stopOpacity="0.4" />
					<stop offset="1" stopColor="white" />
				</linearGradient>
			</defs>
		</svg>
	)
}
