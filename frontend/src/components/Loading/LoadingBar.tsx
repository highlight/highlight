import BarLoader from 'react-spinners/BarLoader'
import styles from './Loading.module.css'

export const LoadingBar = ({
	width,
	height,
}: {
	height?: string | number
	width?: string | number
}) => {
	return (
		<div className={styles.spinnerWrapper}>
			<div
				style={{ width: width || 100 }}
				className={styles.spinnerStyle}
			>
				<BarLoader width={width} height={height} color="#5629c6" />
			</div>
		</div>
	)
}
