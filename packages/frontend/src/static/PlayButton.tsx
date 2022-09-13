import * as React from 'react'

function SvgPlayButton(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="1em"
			height="1em"
			viewBox="0 0 45 43"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M43.795 21.5c0 11.587-9.615 21-21.5 21s-21.5-9.413-21.5-21 9.615-21 21.5-21 21.5 9.413 21.5 21z"
				fill="#F2EEFB"
				stroke="#5629C6"
			/>
			<path
				d="M30.295 20.268c1.333.77 1.333 2.694 0 3.464l-10.5 6.062c-1.333.77-3-.192-3-1.732V15.938c0-1.54 1.667-2.502 3-1.732l10.5 6.062z"
				fill="#5629C6"
			/>
		</svg>
	)
}

export default SvgPlayButton
