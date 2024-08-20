import { IconProps } from './types'

export const IconOutlineGift = ({ size = '1em', ...props }: IconProps) => {
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
				d="M9.5 4a1.5 1.5 0 1 0 0 3H11V5.5A1.5 1.5 0 0 0 9.5 4Zm2.863-.514A3.5 3.5 0 0 0 6.337 7H5a3 3 0 0 0-1 5.83V19a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-6.17A3.001 3.001 0 0 0 19 7h-2.17a3 3 0 0 0-4.467-3.514ZM13 6v1h1a1 1 0 1 0-1-1Zm-2 3H5a1 1 0 0 0 0 2h6V9Zm0 4H6v6a1 1 0 0 0 1 1h4v-7Zm2 7v-7h5v6a1 1 0 0 1-1 1h-4Zm0-9V9h6a1 1 0 1 1 0 2h-6Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
