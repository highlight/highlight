import Head from 'next/head'
import styles from '../styles/Home.module.css'

import { faPlay, faHandPointUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import RequestForm from '../components/request-form.js'

export default function Home() {
    return (
        <>
            <div className={styles.pricingWrap}>
                <div className={styles.pricingHeader}>
                    Scale your subscription with your needs.
                </div>
                <div className={styles.pricingSubHeader}>
                    An afforable solution for any scale.
                </div>
                <div className={styles.pricingCards}>
                    <div className={styles.pricingCard}>
                        <div>
                            <span className={styles.pricingTag}>Starter</span>
                        </div>
                        <div className={styles.price}>$20 USD</div>
                        <div className={styles.priceSubHeader}>
                            billed monthly
                        </div>
                        <div className={styles.featuresText}>Features:</div>
                        <div className={styles.featureItem}>
                            Up to 3 admin users.
                        </div>
                        <div className={styles.featureItem}>
                            1000 page views / month.
                        </div>
                        <div className={styles.featureItem}>
                            200 unique visitors / month.
                        </div>
                        <div className={styles.featureItem}>
                            Unlimited access to dev tools.
                        </div>
                    </div>
                    <div className={styles.pricingCard}>
                        <div>
                            <span className={styles.pricingTag}>Standard</span>
                        </div>
                        <div className={styles.price}>$150 USD</div>
                        <div className={styles.priceSubHeader}>
                            billed monthly
                        </div>
                        <div className={styles.featuresText}>Features:</div>
                        <div className={styles.featureItem}>
                            Unlimited admin users.
                        </div>
                        <div className={styles.featureItem}>
                            10,000 tracked page views / month.
                        </div>
                        <div className={styles.featureItem}>
                            1000 unique visitors tracked / month.
                        </div>
                        <div className={styles.featureItem}>
                            Unlimited access to session dev tools.
                        </div>
                    </div>
                    <div className={styles.pricingCard}>
                        <div>
                            <span className={styles.pricingTag}>
                                Enterprise
                            </span>
                        </div>
                        <div className={styles.price}>$300+ USD</div>
                        <div className={styles.priceSubHeader}>
                            billed monthly
                        </div>
                        <div className={styles.featuresText}>Features:</div>
                        <div className={styles.featureItem}>
                            SAML Single Sign-on
                        </div>
                        <div className={styles.featureItem}>
                            Custom tracked page views.
                        </div>
                        <div className={styles.featureItem}>
                            Custom unique visitors tracked.
                        </div>
                        <div className={styles.featureItem}>
                            Unlimited access to session dev tools.
                        </div>
                    </div>
                </div>
                <RequestForm />
            </div>
        </>
    )
}
