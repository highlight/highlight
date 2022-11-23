import React from 'react'
import { IconProps } from './types'

type Props = IconProps & {
	color?: string
	size?: number | string
}

export const IconTrendingUp: React.FC<Props> = ({ size = 14, color }) => {
	color = color ?? 'currentColor'
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 12 8"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M7.40002 1.9C7.01343 1.9 6.70002 1.5866 6.70002 1.2C6.70002 0.813401 7.01343 0.5 7.40002 0.5H10.9C11.2866 0.5 11.6 0.813401 11.6 1.2V4.7C11.6 5.0866 11.2866 5.4 10.9 5.4C10.5134 5.4 10.2 5.0866 10.2 4.7V2.88995L7.195 5.89497C6.92163 6.16834 6.47842 6.16834 6.20505 5.89497L4.60002 4.28995L1.595 7.29497C1.32163 7.56834 0.878417 7.56834 0.60505 7.29497C0.331683 7.02161 0.331683 6.57839 0.60505 6.30503L4.10505 2.80503C4.37842 2.53166 4.82163 2.53166 5.095 2.80503L6.70002 4.41005L9.21008 1.9H7.40002Z"
				fill={color}
			/>
		</svg>
	)
}
