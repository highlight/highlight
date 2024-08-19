import { IconProps } from './types'

export const IconSolidLoading = ({ size = '1em', ...props }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			fill="none"
			viewBox="0 0 20 20"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				d="M10 3c0-.552.45-1.006.997-.938a8 8 0 0 1 .987 15.688c-.535.137-1.037-.257-1.107-.805-.069-.548.323-1.04.852-1.2a6 6 0 0 0-.734-11.662C10.451 3.991 10 3.553 10 3Z"
			/>
		</svg>
	)
}
