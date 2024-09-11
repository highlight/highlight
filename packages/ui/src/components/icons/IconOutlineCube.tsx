import { IconProps } from './types'

export const IconOutlineCube = ({ size = '1em', ...props }: IconProps) => {
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
				d="M11.553 2.106a1 1 0 0 1 .894 0l8 4A1 1 0 0 1 21 7v10a1 1 0 0 1-.553.894l-8 4a1 1 0 0 1-.894 0l-8-4A1 1 0 0 1 3 17V7a1 1 0 0 1 .553-.894l8-4ZM5 8.618l6 3v7.764l-6-3V8.618Zm8 10.764 6-3V8.618l-6 3v7.764Zm-1-9.5L17.764 7 12 4.118 6.236 7 12 9.882Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
