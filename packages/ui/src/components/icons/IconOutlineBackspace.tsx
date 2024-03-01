import { IconProps } from './types'

export const IconOutlineBackspace = ({ size = '1em', ...props }: IconProps) => {
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
				d="M8.707 4.879A3 3 0 0 1 10.828 4H19a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-8.172a3 3 0 0 1-2.12-.879l-6.415-6.414a1 1 0 0 1 0-1.414l6.414-6.414ZM10.828 6a1 1 0 0 0-.707.293L4.414 12l5.707 5.707a1 1 0 0 0 .707.293H19a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-8.172Zm.465 3.293a1 1 0 0 1 1.414 0L14 10.586l1.293-1.293a1 1 0 1 1 1.414 1.414L15.414 12l1.293 1.293a1 1 0 0 1-1.414 1.414L14 13.414l-1.293 1.293a1 1 0 0 1-1.414-1.414L12.586 12l-1.293-1.293a1 1 0 0 1 0-1.414Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
