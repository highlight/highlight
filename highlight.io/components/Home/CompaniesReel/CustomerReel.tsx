import classNames from 'classnames'
import Image from 'next/legacy/image'
import Airplane from '../../../public/images/companies/airplane.png'
import Basedash from '../../../public/images/companies/basedash.png'
import Dripos from '../../../public/images/companies/dripos.png'
import Hightouch from '../../../public/images/companies/hightouch.png'
import Impira from '../../../public/images/companies/impira.png'
import Knock from '../../../public/images/companies/knock.png'
import Mage from '../../../public/images/companies/mage.png'
import Pipe from '../../../public/images/companies/pipe.png'
import Portal from '../../../public/images/companies/portal.png'
import Secoda from '../../../public/images/companies/secoda.svg'
import styles from '../../Home/Home.module.scss'

export const CustomerReel = () => {
	return (
		<div className={styles.customerReel}>
			<div className={styles.companies}>
				<Image
					src={Pipe}
					alt="Pipe"
					className={styles.scaleHeight}
					style={{ transform: 'scale(0.9)' }}
				/>
				<Image
					src={Portal}
					alt="Portal"
					className={styles.scaleHeight}
				/>
				<Image
					src={Dripos}
					alt="Dripos"
					className={styles.scaleHeight}
				/>
				<Image src={Knock} alt="Knock" className={styles.scaleHeight} />
				<Image
					src={Hightouch}
					alt="Hightouch"
					className={styles.scaleHeight}
					style={{ transform: 'scale(1.1)' }}
				/>
				<Image src={Basedash} alt="Basedash" />
				<Image
					src={Impira}
					alt="Impira"
					className={styles.scaleHeight}
				/>
				<Image src={Mage} alt="Mage" className={styles.scaleHeight} />
				<Image
					src={Airplane}
					alt="Airplane"
					className={styles.scaleHeight}
				/>
				<div
					className={classNames(
						styles.tabletGraphic,
						styles.hideMobile,
					)}
				></div>
				<Image
					src={Secoda}
					alt="Secoda"
					className={styles.scaleHeight}
					style={{ transform: 'scale(0.8)' }}
				/>
			</div>
		</div>
	)
}
