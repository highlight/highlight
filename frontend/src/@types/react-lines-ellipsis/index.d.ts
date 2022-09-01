declare module 'react-lines-ellipsis' {
	import * as React from 'react'

	interface ReactLinesEllipsisProps {
		basedOn?: 'letters' | 'words'
		className?: string
		component?: string
		ellipsis?: string
		isClamped?: () => boolean
		maxLine?: number | string
		onReflow?: ({
			clamped,
			text,
		}: {
			clamped: boolean
			text: string
		}) => any
		style?: React.CSSProperties
		text?: string
		trimRight?: boolean
		winWidth?: number
	}

	class LinesEllipsis extends React.Component<ReactLinesEllipsisProps> {
		static defaultProps?: ReactLinesEllipsisProps
	}

	export default LinesEllipsis
}

declare module 'react-lines-ellipsis/lib/responsiveHOC' {
	import * as React from 'react'

	export default function responsiveHOC(): <P extends object>(
		WrappedComponent: React.ComponentType<
			React.PropsWithChildren<React.PropsWithChildren<P>>
		>,
	) => React.ComponentClass<P>
}
