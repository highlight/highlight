import React from 'react'
import { IconProps } from './types'

export const IconCaretDown: React.FC<IconProps> = ({ size }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 14 14"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M3.70503 5.10505C3.97839 4.83168 4.42161 4.83168 4.69497 5.10505L7 7.41007L9.30503 5.10505C9.57839 4.83168 10.0216 4.83168 10.295 5.10505C10.5683 5.37842 10.5683 5.82163 10.295 6.095L7.49497 8.895C7.22161 9.16837 6.77839 9.16837 6.50503 8.895L3.70503 6.095C3.43166 5.82163 3.43166 5.37842 3.70503 5.10505Z"
			fill="currentColor"
		/>
	</svg>
)
