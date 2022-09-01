import * as React from 'react'

function SvgPanelBottomIcon(props: React.SVGProps<SVGSVGElement>) {
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
				id="panel-bottom-icon_svg__a"
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
					stroke="gray"
				/>
			</mask>
			<g mask="url(#panel-bottom-icon_svg__a)" stroke="currentColor">
				<rect
					x={1}
					y={1.5}
					width={14}
					height={14}
					rx={1}
					fill="#fff"
					strokeWidth={2}
				/>
				<path fill="currentColor" d="M.5 10.778h15V16H.5z" />
			</g>
		</svg>
	)
}

export default SvgPanelBottomIcon
