import * as React from 'react'

function SvgAnnouncementIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			fill="none"
			viewBox="4 4 16 16"
			{...props}
		>
			<path
				stroke="currentColor"
				strokeWidth={1.5}
				d="M19.25 10c0 2.729-1.4 5.25-2.75 5.25s-2.75-2.521-2.75-5.25 1.4-5.25 2.75-5.25 2.75 2.521 2.75 5.25z"
			/>
			<path
				stroke="currentColor"
				strokeWidth={1.5}
				d="M16.5 15.25S8 13.5 7 13.25 4.75 11.69 4.75 10 6 7 7 6.75s9.5-2 9.5-2M6.75 13.5v3.75a2 2 0 002 2h.5a2 2 0 002-2V14.5"
			/>
		</svg>
	)
}

export default SvgAnnouncementIcon
