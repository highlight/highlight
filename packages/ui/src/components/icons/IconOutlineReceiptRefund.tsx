import { IconProps } from './types'

export const IconOutlineReceiptRefund = ({
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
				d="M3 5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v16a1 1 0 0 1-1.447.894L16 20.118l-3.553 1.776a1 1 0 0 1-.894 0L8 20.118l-3.553 1.776A1 1 0 0 1 3 21V5Zm3-1a1 1 0 0 0-1 1v14.382l2.553-1.276a1 1 0 0 1 .894 0L12 19.882l3.553-1.776a1 1 0 0 1 .894 0L19 19.382V5a1 1 0 0 0-1-1H6Zm5.707 2.293a1 1 0 0 1 0 1.414L10.414 9H12a5 5 0 0 1 5 5v1a1 1 0 1 1-2 0v-1a3 3 0 0 0-3-3h-1.586l1.293 1.293a1 1 0 0 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414l3-3a1 1 0 0 1 1.414 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
