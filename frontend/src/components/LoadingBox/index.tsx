import { Box, BoxProps, ButtonProps } from '@highlight-run/ui/components'
import { Button } from '@components/Button'

type LoadingBoxProps = Omit<BoxProps, 'height' | 'width' | 'size'> & {
	height?: string | number
	size?: ButtonProps['size']
	width?: string | number
	style?: React.CSSProperties
}
const LoadingBox: React.FC<LoadingBoxProps> = ({
	height,
	size = 'small',
	style = {},
	width,
	...props
}) => {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="center"
			{...props}
			style={{
				...style,
				height: (height ?? '100%') as string | number,
				width: (width ?? '100%') as string | number,
			}}
		>
			<Button
				kind="secondary"
				emphasis="low"
				loading
				trackingId="loading"
				size={size}
			>
				Loading...
			</Button>
		</Box>
	)
}

export const LoadingBox_test = <LoadingBox height={200} width={200} />

export default LoadingBox
