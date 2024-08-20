import { IconProps } from './types'

export const IconSolidPhoneMissedCall = ({
	size = '1em',
	...props
}: IconProps) => {
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
				d="M2 3a1 1 0 0 1 1-1h2.153a1 1 0 0 1 .986.836l.74 4.435a1 1 0 0 1-.54 1.06l-1.548.773a11.037 11.037 0 0 0 6.105 6.105l.774-1.548a1 1 0 0 1 1.059-.54l4.435.74a1 1 0 0 1 .836.986V17a1 1 0 0 1-1 1h-2C7.82 18 2 12.18 2 5V3Z"
			/>
			<path
				fill="currentColor"
				d="M16.707 3.293a1 1 0 0 1 0 1.414L15.414 6l1.293 1.293a1 1 0 0 1-1.414 1.414L14 7.414l-1.293 1.293a1 1 0 1 1-1.414-1.414L12.586 6l-1.293-1.293a1 1 0 0 1 1.414-1.414L14 4.586l1.293-1.293a1 1 0 0 1 1.414 0Z"
			/>
		</svg>
	)
}
