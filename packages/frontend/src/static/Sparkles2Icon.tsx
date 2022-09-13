import * as React from 'react'

function SvgSparkles2Icon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="4 4 16 16"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M17 4.75C17 5.897 15.897 7 14.75 7 15.897 7 17 8.103 17 9.25 17 8.103 18.103 7 19.25 7 18.103 7 17 5.897 17 4.75zM17 14.75c0 1.147-1.103 2.25-2.25 2.25 1.147 0 2.25 1.103 2.25 2.25 0-1.147 1.103-2.25 2.25-2.25-1.147 0-2.25-1.103-2.25-2.25zM9 7.75C9 9.917 6.917 12 4.75 12 6.917 12 9 14.083 9 16.25 9 14.083 11.083 12 13.25 12 11.083 12 9 9.917 9 7.75z"
				stroke="currentColor"
				strokeWidth={1.5}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default SvgSparkles2Icon
