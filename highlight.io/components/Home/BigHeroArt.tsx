import classNames from 'classnames'
import Image from 'next/legacy/image'
import MobileHeroSection from '../../public/images/mobile-insects.png'
import styles from './Home.module.scss'

export const BigHeroArt = () => {
	return (
		<>
			<div className={classNames(styles.bigHero, styles.hideMobile)}>
				<div className={classNames(styles.hero)}>
					<video playsInline autoPlay muted loop id="big-hero-video">
						<source
							src="/images/big-hero.webm"
							type="video/webm"
						></source>
					</video>
				</div>
			</div>
			<div className={classNames(styles.hero, styles.mobile)}>
				<Image src={MobileHeroSection} alt="hero" />
			</div>
		</>
	)
}
