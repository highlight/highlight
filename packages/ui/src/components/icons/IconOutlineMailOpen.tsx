import { IconProps } from './types'

export const IconOutlineMailOpen = ({ size = '1em', ...props }: IconProps) => {
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
				d="M12.555 4.572a1 1 0 0 0-1.11 0l-7 4.666a1 1 0 0 0-.304.32l7.304 4.87a1 1 0 0 0 1.11 0l7.304-4.87a1 1 0 0 0-.304-.32l-7-4.666Zm9.44 5.328a3 3 0 0 0-1.33-2.326l-7-4.666a3 3 0 0 0-3.33 0l-7 4.666A3 3 0 0 0 2 10.07V19a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8.93a3.028 3.028 0 0 0-.005-.17ZM20 11.868 16.053 14.5 20 17.131v-5.263Zm-.112 7.592-5.638-3.758-.586.39a3 3 0 0 1-3.328 0l-.586-.39-5.638 3.758A1 1 0 0 0 5 20h14a1 1 0 0 0 .888-.54ZM4 17.131 7.947 14.5 4 11.868v5.263Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
