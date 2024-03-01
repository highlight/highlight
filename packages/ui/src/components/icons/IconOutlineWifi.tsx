import { IconProps } from './types'

export const IconOutlineWifi = ({ size = '1em', ...props }: IconProps) => {
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
				d="M21.9 10.1c-5.468-5.467-14.332-5.467-19.8 0A1 1 0 0 1 .687 8.687c6.249-6.248 16.38-6.248 22.628 0a1 1 0 0 1-1.414 1.415Zm-3.536 3.536a9 9 0 0 0-12.728 0 1 1 0 0 1-1.414-1.414c4.296-4.296 11.26-4.296 15.556 0a1 1 0 0 1-1.414 1.414Zm-3.182 3.475a4.5 4.5 0 0 0-6.364 0 1 1 0 0 1-1.414-1.414 6.5 6.5 0 0 1 9.192 0 1 1 0 1 1-1.414 1.414ZM11 20a1 1 0 0 1 1-1h.01a1 1 0 0 1 0 2H12a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
