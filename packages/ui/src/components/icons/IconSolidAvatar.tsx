import { IconProps } from './types'

export const IconSolidAvatar = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 42 42"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<g clipPath="url(#clip0_3957_11497)">
				<rect
					width="42"
					height="42"
					rx="21"
					fill="#161618"
					fillOpacity="0.1"
				/>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M33.8 21C33.8 28.0692 28.0692 33.8 21 33.8C13.9308 33.8 8.2 28.0692 8.2 21C8.2 13.9308 13.9308 8.2 21 8.2C28.0692 8.2 33.8 13.9308 33.8 21ZM24.2 16.2C24.2 17.9673 22.7673 19.4 21 19.4C19.2327 19.4 17.8 17.9673 17.8 16.2C17.8 14.4327 19.2327 13 21 13C22.7673 13 24.2 14.4327 24.2 16.2ZM20.9999 22.6C17.7718 22.6 14.9903 24.5119 13.726 27.2651C15.4864 29.3072 18.0922 30.6 21 30.6C23.9076 30.6 26.5134 29.3073 28.2739 27.2653C27.0096 24.512 24.228 22.6 20.9999 22.6Z"
					fill="#C8C7CB"
				/>
			</g>
			<defs>
				<clipPath id="clip0_3957_11497">
					<rect width="42" height="42" fill="white" />
				</clipPath>
			</defs>
		</svg>
	)
}
