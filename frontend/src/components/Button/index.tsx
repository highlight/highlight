// eslint-disable-next-line no-restricted-imports
import { Button as UIButton, ButtonProps } from '@highlight-run/ui'

type Props = ButtonProps & {
	trackingId: string
}

export const Button: React.FC<Props> = ({ children, ...props }) => {
	return <UIButton {...props}>{children}</UIButton>
}
