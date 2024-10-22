import { IconProps } from './types'

export const IconOutlineReceiptTax = ({
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
				d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v16a1 1 0 0 1-1.496.868L15.5 20.152l-3.004 1.716a1 1 0 0 1-.992 0L8.5 20.152l-3.004 1.716A1 1 0 0 1 4 21V5Zm3-1a1 1 0 0 0-1 1v14.277l2.004-1.145a1 1 0 0 1 .992 0L12 19.848l3.004-1.716a1 1 0 0 1 .992 0L18 19.277V5a1 1 0 0 0-1-1H7Zm1 4.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6.293-1.207a1 1 0 1 1 1.414 1.414l-6 6a1 1 0 0 1-1.414-1.414l6-6ZM13 13.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
