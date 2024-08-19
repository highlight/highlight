import { IconProps } from './types'

export const IconSolidTranslate = ({ size = '1em', ...props }: IconProps) => {
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
				fillRule="evenodd"
				d="M7 2a1 1 0 0 1 1 1v1h3a1 1 0 1 1 0 2H9.578a18.87 18.87 0 0 1-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 1 1-1.44 1.389 21.034 21.034 0 0 1-.554-.6 19.098 19.098 0 0 1-3.107 3.567 1 1 0 0 1-1.334-1.49 17.087 17.087 0 0 0 3.13-3.733 18.992 18.992 0 0 1-1.487-2.494 1 1 0 1 1 1.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 1 1 0-2h3V3a1 1 0 0 1 1-1Zm6 6a1 1 0 0 1 .894.553l2.991 5.982a.869.869 0 0 1 .02.037l.99 1.98a1 1 0 1 1-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 1 1-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0 1 13 8Zm-1.382 6h2.764L13 11.236 11.618 14Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
