import { IconProps } from './types'

export const IconSolidPlay = ({ size = '1em', ...props }: IconProps) => {
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
				d="M16.14 11.572c1.311-.706 1.311-2.588 0-3.294L6.756 3.226C5.511 2.556 4 3.458 4 4.873v10.104c0 1.415 1.511 2.318 2.757 1.647l9.382-5.052Z"
			/>
		</svg>
	)
}
