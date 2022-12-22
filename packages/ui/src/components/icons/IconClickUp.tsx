import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	size?: number | string
}

export const IconClickUp: React.FC<Props> = ({ size }) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M5.32001 1.3H14.68C16.9002 1.3 18.7 3.09982 18.7 5.32001V14.68C18.7 16.9002 16.9002 18.7 14.68 18.7H5.32001C3.09982 18.7 1.3 16.9002 1.3 14.68V5.32001C1.3 3.09982 3.09982 1.3 5.32001 1.3Z"
				fill="white"
				stroke="#DCDBDD"
				strokeWidth="0.6"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M4.72653 13.3428L6.6732 11.8517C7.70695 13.2014 8.80475 13.8234 10.028 13.8234C11.2446 13.8234 12.3122 13.2085 13.2996 11.8696L15.2731 13.325C13.8494 15.2554 12.0782 16.2754 10.028 16.2754C7.98468 16.2754 6.19703 15.2626 4.72653 13.3428Z"
				fill="url(#paint0_linear_590_7245)"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M10.0215 6.86193L6.5567 9.84745L4.95605 7.98987L10.0283 3.61914L15.0612 7.99328L13.4527 9.84406L10.0215 6.86193Z"
				fill="url(#paint1_linear_590_7245)"
			/>
			<defs>
				<linearGradient
					id="paint0_linear_590_7245"
					x1="4.72653"
					y1="14.8602"
					x2="15.2731"
					y2="14.8602"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#8930FD" />
					<stop offset="1" stopColor="#49CCF9" />
				</linearGradient>
				<linearGradient
					id="paint1_linear_590_7245"
					x1="4.95605"
					y1="7.85476"
					x2="15.0612"
					y2="7.85476"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#FF02F0" />
					<stop offset="1" stopColor="#FFC800" />
				</linearGradient>
			</defs>
		</svg>
	)
}
