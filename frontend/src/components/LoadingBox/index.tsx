// eslint-disable-next-line no-restricted-imports
import { Button } from '@components/Button'
import { Box, BoxProps } from '@highlight-run/ui/src/components/Box/Box'

type LoadingBoxProps = Omit<BoxProps, 'height' | 'width'> & {
	height?: string | number
	width?: string | number
}
const LoadingBox: React.FC<LoadingBoxProps> = ({ height, width, ...props }) => {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="center"
			{...props}
			style={{
				height: (height ?? '100%') as string | number,
				width: (width ?? '100%') as string | number,
			}}
		>
			<Button
				kind="secondary"
				emphasis="low"
				loading
				trackingId="loading"
			>
				Loading...
			</Button>
		</Box>
	)
}

export const LoadingBox_test = <LoadingBox height={200} width={200} />

export default LoadingBox
