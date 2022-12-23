import React from 'react'
import { IconProps } from './types'

export const IconSolidLoading = (props: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			fill="none"
			viewBox="0 0 142 39"
			focusable="false"
			{...props}
		>
			<path
				fill="currentColor"
				d="M19 13c0-.552.45-1.007.997-.938a8 8 0 0 1 .987 15.688c-.535.137-1.037-.257-1.107-.805-.069-.548.323-1.04.852-1.2a6 6 0 0 0-.734-11.662C19.451 13.992 19 13.553 19 13Zm76 14c0 .552-.45 1.006-.997.938a8 8 0 0 1-.987-15.688c.535-.137 1.037.257 1.107.805.069.548-.323 1.04-.852 1.2a6 6 0 0 0 .734 11.662c.544.091.995.53.995 1.083Zm25.878-13.999c-.01-.552.432-1.014.981-.955a8 8 0 0 1 1.26 15.668c-.532.146-1.042-.239-1.121-.786-.078-.546.305-1.045.831-1.214a6 6 0 0 0-.937-11.647c-.546-.082-1.005-.514-1.014-1.066Z"
			/>
			<rect
				width={141}
				height={38}
				x={0.5}
				y={0.5}
				stroke="currentColor"
				strokeDasharray="10 5"
				rx={4.5}
			/>
		</svg>
	)
}
