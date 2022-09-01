declare module 'react-user-avatar' {
	import * as React from 'react'

	interface ReactUserAvatarProps {
		src: string
		name: string
		size: string
	}

	class ReactUserAvatar extends React.Component<ReactUserAvatarProps> {
		static defaultProps?: ReactUserAvatarProps
	}

	export default ReactUserAvatar
}
