// eslint-disable-next-line no-restricted-imports
import { Button as UIButton, ButtonProps } from '@highlight-run/ui'
import analytics from '@util/analytics'

type Props = ButtonProps & {
	trackingId: string
	trackingProperties?: any
}

export const Button: React.FC<Props> = ({
	children,
	trackingId,
	trackingProperties = {},
	onClick,
	...props
}) => {
	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
		analytics.track(trackingId, trackingProperties)

		if (onClick) {
			onClick(e)
		}
	}

	return (
		<UIButton {...props} onClick={handleClick}>
			{children}
		</UIButton>
	)
}
