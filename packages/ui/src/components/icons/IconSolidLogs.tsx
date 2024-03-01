import { IconProps } from './types'

export const IconSolidLogs = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 16 14"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				fillRule="evenodd"
				d="M0 3a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3Zm3 1.752c0-.69.56-1.25 1.25-1.25h7.5a1.25 1.25 0 1 1 0 2.5h-7.5c-.69 0-1.25-.56-1.25-1.25Zm1.25 3.246a1.25 1.25 0 1 0 0 2.5h4.5a1.25 1.25 0 1 0 0-2.5h-4.5Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
