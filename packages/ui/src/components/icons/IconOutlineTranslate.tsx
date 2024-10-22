import { IconProps } from './types'

export const IconOutlineTranslate = ({ size = '1em', ...props }: IconProps) => {
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
				d="M9 2a1 1 0 0 1 1 1v1h5a1 1 0 1 1 0 2h-1.422a18.914 18.914 0 0 1-3.292 7.286c.157.176.318.35.482.52a1 1 0 0 1-1.44 1.389 19.02 19.02 0 0 1-.328-.35 19.06 19.06 0 0 1-5.555 4.18 1 1 0 1 1-.89-1.792 17.062 17.062 0 0 0 5.159-3.947A18.978 18.978 0 0 1 5.49 9.389a1 1 0 1 1 1.842-.778A16.963 16.963 0 0 0 9 11.646 16.915 16.915 0 0 0 11.527 6H3a1 1 0 1 1 0-2h5V3a1 1 0 0 1 1-1Zm7 8a1 1 0 0 1 .894.553l3.491 6.982.02.037 1.49 2.98a1 1 0 1 1-1.79.895L18.883 19h-5.764l-1.224 2.447a1 1 0 1 1-1.788-.894l1.49-2.98.019-.038 3.49-6.982A1 1 0 0 1 16 10Zm-1.882 7h3.764L16 13.236 14.118 17Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
