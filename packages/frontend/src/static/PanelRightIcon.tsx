import * as React from 'react'

function SvgPanelRightIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 16 17"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<mask
				id="panel-right-icon_svg__a"
				maskUnits="userSpaceOnUse"
				x={0}
				y={0}
				width={16}
				height={17}
			>
				<rect
					x={0.5}
					y={1}
					width={15}
					height={15}
					rx={1.5}
					fill="#fff"
					stroke="#5629C6"
				/>
			</mask>
			<g mask="url(#panel-right-icon_svg__a)">
				<rect
					x={1}
					y={1.5}
					width={14}
					height={14}
					rx={1}
					fill="#fff"
					stroke="currentColor"
					strokeWidth={2}
				/>
				<path fill="currentColor" d="M9.778.5H16v16H9.778z" />
			</g>
		</svg>
	)
}

export default SvgPanelRightIcon
