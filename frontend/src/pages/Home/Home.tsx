import React, { useState } from 'react';
import styles from './Home.module.scss';
import { ReactComponent as Humans } from '../../static/human-image.svg';
import { ReactComponent as Logos } from '../../static/logos.svg';
import { HighlightLogo } from '../../components/HighlightLogo/HighlightLogo';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import ReactPlayer from 'react-player';

export const Home = ({
    children,
}: React.PropsWithChildren<Record<string, unknown>>) => {
    const [showVideo, setShowVideo] = useState(false);
    return (
        <div className={styles.homePageWrapper}>
            <div className={styles.stylingWrapper}>
                <div className={styles.nav}>
                    <HighlightLogo />
                    <div style={{ marginLeft: 'auto' }}>
                        <Link
                            to={{ pathname: 'https://docs.highlight.run' }}
                            target="_blank"
                        >
                            <div style={{ marginLeft: 'auto' }}>Docs</div>
                        </Link>
                        <button onClick={() => setShowVideo(true)}>
                            video
                        </button>
                    </div>
                </div>
                <div className={styles.landingWrapper}>
                    <div className={styles.landing}>
                        <div className={styles.header}>
                            Understand your app, with clarity.
                        </div>
                        <div className={styles.subHeader}>
                            Get full transparency into the errors, interactions,
                            and performance metrics on your frontend.
                        </div>
                        <Humans className={styles.humans} />
                        <div className={styles.logoHeader}>
                            Highlight powers forward thinking companies.
                        </div>
                        <Logos className={styles.logos} />
                    </div>
                </div>
            </div>
            <div className={styles.contentWrapper}>{children}</div>
        </div>
    );
};
