import { IconProps } from './types'

export const IconOutlineVolumeOff = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 24 24"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M9.586 3.586C10.846 2.326 13 3.218 13 5v14c0 1.782-2.154 2.674-3.414 1.414L5.172 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1.172l4.414-4.414ZM11 5 6.293 9.707a1 1 0 0 1-.707.293H4v4h1.586a1 1 0 0 1 .707.293L11 19V5Zm5.293 4.293a1 1 0 0 1 1.414 0L19 10.586l1.293-1.293a1 1 0 1 1 1.414 1.414L20.414 12l1.293 1.293a1 1 0 0 1-1.414 1.414L19 13.414l-1.293 1.293a1 1 0 0 1-1.414-1.414L17.586 12l-1.293-1.293a1 1 0 0 1 0-1.414Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
