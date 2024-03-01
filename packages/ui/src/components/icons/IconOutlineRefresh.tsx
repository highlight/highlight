import { IconProps } from './types'

export const IconOutlineRefresh = ({ size = '1em', ...props }: IconProps) => {
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
				d="M4 3a1 1 0 0 1 1 1v2.343A8.982 8.982 0 0 1 12 3a9.001 9.001 0 0 1 8.93 7.876 1 1 0 1 1-1.984.248A7.001 7.001 0 0 0 6.254 8H9a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm-.062 9.008a1 1 0 0 1 1.116.868A7.001 7.001 0 0 0 17.746 16H15a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-2.343A8.982 8.982 0 0 1 12 21a9.001 9.001 0 0 1-8.93-7.876 1 1 0 0 1 .868-1.116Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
