import { IconProps } from './types'

export const IconOutlineCurrencyRupee = ({
	size = '1em',
	...props
}: IconProps) => {
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
				d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm6-4a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2h-1.535c.179.31.318.645.409 1H15a1 1 0 1 1 0 2h-1.126a4.008 4.008 0 0 1-2.65 2.81l1.483 1.483a1 1 0 0 1-1.414 1.414l-3-3A1 1 0 0 1 9 13h1a2 2 0 0 0 1.732-1H9a1 1 0 1 1 0-2h2.732A2 2 0 0 0 10 9H9a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
