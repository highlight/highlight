import { IconProps } from './types'

export const IconOutlineLightBulb = ({ size = '1em', ...props }: IconProps) => {
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
				d="M12 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1ZM4.929 4.929a1 1 0 0 1 1.414 0l.707.707A1 1 0 1 1 5.636 7.05l-.707-.707a1 1 0 0 1 0-1.414Zm14.142 0a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0Zm-9.9 4.243a4 4 0 0 0 0 5.656l.548.548c.193.193.366.402.518.624h3.526a4.38 4.38 0 0 1 .518-.624l.547-.547a4 4 0 0 0-5.656-5.657Zm6.074 8.247c.114-.231.265-.444.45-.63l.548-.546a6 6 0 1 0-8.486 0l.547.547A2.374 2.374 0 0 1 9 18.469V19a3 3 0 1 0 6 0v-.531a2.374 2.374 0 0 1 .245-1.05Zm-2.22.581h-2.05c.017.155.025.312.025.469V19a1 1 0 1 0 2 0v-.531c0-.157.008-.314.025-.469ZM2 12a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2H3a1 1 0 0 1-1-1Zm17 0a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2h-1a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
