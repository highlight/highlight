import Link from 'next/link'
import { Typography } from '../../common/Typography/Typography'
import styles from '../../Home/Home.module.scss'
import { CustomerReel } from './CustomerReel'

export const CompaniesReel = () => {
	return (
		<div className={styles.anchorFeature} id="customers">
			<div className={styles.anchorHead}>
				<h2 className="mb-2">{`Our customers`}</h2>
				<Typography type="copy2" onDark>
					Highlight powers forward-thinking companies.{' '}
					<Link href="/customers">More about our customers →</Link>
				</Typography>
			</div>
			<CustomerReel />
		</div>
	)
}
