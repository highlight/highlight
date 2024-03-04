import ReactCompareImage from 'react-compare-image'
import ObfuscatedText from '../../../public/images/obfuscatedtext.png'
import RegularText from '../../../public/images/regulartext.png'
import styles from '../../Home/Home.module.scss'

export const ObfuscationSlider = () => {
	return (
		<ReactCompareImage
			leftImage={RegularText.src}
			rightImage={ObfuscatedText.src}
			sliderLineColor="#72E4FC"
			sliderLineWidth={3}
			handle={
				<div className={styles.obfuscationHandle}>
					<div className={styles.arrow1}></div>
					<div className={styles.arrow2}></div>
				</div>
			}
		/>
	)
}
