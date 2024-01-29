import Image from 'next/legacy/image'
import HighlightLogoFull from '../../../public/images/logo-and-text-on-dark.svg'
import HighlightLogoLightImg from '../../../public/images/logo-and-text-on-light.svg'
import HighlightLogoWhiteFull from '../../../public/images/logo-and-text-on-purple.svg'
import styles from './HighlightLogo.module.scss'

export const HighlightLogo = () => {
	return (
		<div className={styles.logoDiv}>
			<Image src={HighlightLogoFull} alt="" />
		</div>
	)
}

export const HighlightLogoWhite = () => {
	return (
		<div className={styles.logoDiv}>
			<Image src={HighlightLogoWhiteFull} alt="" />
		</div>
	)
}

export const HighlightLogoLight = () => {
	return (
		<div className={styles.logoDiv}>
			<Image src={HighlightLogoLightImg} alt="" />
		</div>
	)
}
