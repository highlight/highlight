import styles from './Products.module.scss'
import { IconType } from 'react-icons'
import { Typography } from '../common/Typography/Typography'

const FeatureBox = ({
	title,
	desc,
	icon,
}: {
	title: string
	desc: string
	icon: JSX.Element
}) => {
	return (
		<div className={styles.featureBox}>
			<div className={styles.featureBoxIcon}>{icon}</div>
			<div className={styles.featureBoxText}>
				<Typography type="copy2" emphasis className="text-white">
					{title}
				</Typography>
				<Typography
					type="copy3"
					className="text-color-darker-copy-on-dark"
				>
					{desc}
				</Typography>
			</div>
		</div>
	)
}

export default FeatureBox
