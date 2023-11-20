// eslint-disable-next-line no-restricted-imports
import { Button, ButtonProps } from '@components/Button'
import { Box, BoxProps } from '@highlight-run/ui/src/components/Box/Box'

type LoadingBoxProps = Omit<BoxProps, 'height' | 'width' | 'size'> & {
	height?: string | number
	size?: ButtonProps['size']
	width?: string | number
}
const LoadingBox: React.FC<LoadingBoxProps> = ({
	height,
	size,
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
