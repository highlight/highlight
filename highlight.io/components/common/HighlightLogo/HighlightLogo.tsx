import Image from 'next/legacy/image'
import HighlightLogoFull from '../../../public/images/logo-and-text-on-dark.svg'
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
