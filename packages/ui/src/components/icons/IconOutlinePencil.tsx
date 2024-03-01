import { IconProps } from './types'

export const IconOutlinePencil = ({ size = '1em', ...props }: IconProps) => {
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
				d="M19.56 4.44a1.5 1.5 0 0 0-2.12 0l-.794.792 2.122 2.122.793-.793a1.5 1.5 0 0 0 0-2.122Zm1.415 3.535a3.5 3.5 0 0 0-4.95-4.95l-1.5 1.5L2.293 16.757a1 1 0 0 0-.293.707v3.572a1 1 0 0 0 1 1h3.5a1 1 0 0 0 .707-.293L20.975 7.975Zm-3.621.793-2.122-2.122L4 17.88v2.156h2.086L17.354 8.768Z"
				clipRule="evenodd"
			/>
		</svg>
	)
}
