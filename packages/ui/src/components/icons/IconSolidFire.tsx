import { IconProps } from './types'

export const IconSolidFire = ({ size = '1em', ...props }: IconProps) => {
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
				d="M11.757 2.034a1 1 0 0 1 .638.519c.483.967.844 1.554 1.207 2.03.368.482.756.876 1.348 1.467A6.981 6.981 0 0 1 17 11 7 7 0 1 1 5.05 6.05a1 1 0 0 1 1.707.707c0 1.12.07 1.973.398 2.654.18.374.46.74.945 1.067.116-1.061.328-2.354.614-3.58.225-.966.505-1.93.839-2.734.167-.403.356-.785.57-1.116.208-.322.477-.65.822-.88a1 1 0 0 1 .812-.134Zm.364 13.087A3 3 0 0 1 7 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0 1 13 13a2.99 2.99 0 0 1-.879 2.121Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
