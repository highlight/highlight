import { IconProps } from './types'

export const IconSolidSkipLeft = ({ size = '1em', ...props }: IconProps) => {
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
				d="M4.167 17c.644 0 1.166-.522 1.166-1.167V4.167a1.167 1.167 0 1 0-2.333 0v11.666C3 16.478 3.522 17 4.167 17Zm3.351-5.47a1.867 1.867 0 0 1 0-3.06l6.545-4.58C15.3 3.022 17 3.907 17 5.418v9.162c0 1.51-1.7 2.396-2.937 1.53l-6.545-4.582Z"
			/>
		</svg>
	)
}
