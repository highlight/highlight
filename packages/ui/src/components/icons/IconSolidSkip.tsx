import { IconProps } from './types'

export const IconSolidSkip = ({ size = '1em', ...props }: IconProps) => {
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
				d="M15.833 3c-.644 0-1.166.522-1.166 1.167v11.666a1.167 1.167 0 1 0 2.333 0V4.167C17 3.522 16.478 3 15.833 3Zm-3.351 5.47a1.867 1.867 0 0 1 0 3.06l-6.545 4.58C4.7 16.978 3 16.093 3 14.582V5.42c0-1.51 1.7-2.396 2.937-1.53l6.545 4.582Z"
			/>
		</svg>
	)
}
