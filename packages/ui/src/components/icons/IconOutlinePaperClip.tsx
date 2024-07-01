import { IconProps } from './types'

export const IconOutlinePaperClip = ({ size = '1em', ...props }: IconProps) => {
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
				d="m12.883 4.874-6.418 6.59a5 5 0 1 0 7.07 7.071h.001l6.258-6.243a1 1 0 1 1 1.412 1.416L14.95 19.95a7 7 0 0 1-9.905-9.895l6.42-6.59a5 5 0 0 1 7.075 7.066l-6.419 6.59A3 3 0 0 1 7.88 12.88l6.585-6.586a1 1 0 1 1 1.415 1.414l-6.586 6.586a1 1 0 0 0 1.41 1.418l6.418-6.59a3 3 0 0 0-4.238-4.247Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
