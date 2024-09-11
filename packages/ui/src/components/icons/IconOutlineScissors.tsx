import { IconProps } from './types'

export const IconOutlineScissors = ({ size = '1em', ...props }: IconProps) => {
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
				d="M7 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 7a4 4 0 1 1 7.446 2.032L12 10.586l6.293-6.293a1 1 0 1 1 1.414 1.414l-9.261 9.261a4 4 0 1 1-1.414-1.414L10.586 12l-1.554-1.554A4 4 0 0 1 3 7Zm4 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6.414-1.586a1 1 0 0 1 1.414 0l4.88 4.879a1 1 0 0 1-1.415 1.414l-4.879-4.879a1 1 0 0 1 0-1.414Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
