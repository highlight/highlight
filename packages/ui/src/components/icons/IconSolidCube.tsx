import React from 'react'
import { IconProps } from './types'

export const IconSolidCube = (props: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 24 24"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93Zm-10.5 14.25v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648l8.628 5.033Z"
			/>
		</svg>
	)
}
