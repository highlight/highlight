import { IconProps } from './types'

export const IconOutlineSaveAs = ({ size = '1em', ...props }: IconProps) => {
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
				d="M14 2a1 1 0 0 1 1 1v6.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L13 9.586V3a1 1 0 0 1 1-1ZM6 7a3 3 0 0 1 3-3h1a1 1 0 1 1 0 2H9a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1a1 1 0 1 1 0-2h1a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-1v1a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3h1V7Zm0 3H5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1H9a3 3 0 0 1-3-3v-4Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
