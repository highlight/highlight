import { IconProps } from './types'

export const IconOutlineQuestionMarkCircle = ({
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
				d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm10-4c-1.472 0-2.528.706-2.868 1.426a1 1 0 0 1-1.809-.852C8.082 6.964 9.99 6 12 6c1.3 0 2.515.394 3.428 1.079C16.343 7.764 17 8.786 17 10c0 2.07-1.834 3.508-3.817 3.889a.31.31 0 0 0-.162.083A.107.107 0 0 0 13 14a1 1 0 0 1-2 0c0-1.142.909-1.904 1.805-2.075C14.279 11.642 15 10.729 15 10c0-.443-.237-.92-.771-1.321C13.694 8.278 12.909 8 12 8Zm-1 9a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H12a1 1 0 0 1-1-1Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
