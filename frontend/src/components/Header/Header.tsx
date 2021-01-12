import React, { useEffect, useContext, useState } from 'react';
import { ReactComponent as HighlightLogoSmall } from '../../static/highlight-logo-small.svg';
import { ReactComponent as Hamburger } from '../../static/hamburger.svg';
import { ReactComponent as Close } from '../../static/close.svg';
import { Link, withRouter } from 'react-router-dom';
import { useParams, RouteComponentProps } from 'react-router-dom';
import { UserDropdown } from './UserDropdown/UserDropdown';
import * as Mousetrap from 'mousetrap';

import styles from './Header.module.scss';
import { DemoContext } from '../../DemoContext';
import { SidebarContext } from '../Sidebar/SidebarContext';
import classNames from 'classnames/bind';
import { Duration } from '../../util/time';

type HeaderProps = {
    trialTimeRemaining?: Duration;
}

const Head: React.FunctionComponent<RouteComponentProps & HeaderProps> = ({ history, ...props }) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { demo } = useContext(DemoContext);
    const { setOpenSidebar, openSidebar } = useContext(SidebarContext);
    const { trialTimeRemaining } = props;

    useEffect(() => {
        const keys = ['command+k', 'ctrl+k'];
        const method = () => {
            history.push(`/${organization_id}/sessions`);
        };

        // @ts-ignore
        Mousetrap.bind(keys, method);

        return () => {
            // @ts-ignore
            Mousetrap.unbind(keys, method);
        };
    }, [history, organization_id]);

    return (
        <>
            <div className={styles.header}>
                {trialTimeRemaining && <TrialBanner timeRemaining={trialTimeRemaining} />}
                <div className={styles.headerContent}>
                    <div className={styles.logoWrapper}>
                        <Hamburger
                            className={styles.hamburger}
                            onClick={() => {
                                console.log('clicked');
                                setOpenSidebar(!openSidebar)
                            }}
                            style={{
                                transform: openSidebar
                                    ? 'rotate(-180deg)'
                                    : 'rotate(0deg)',
                            }}
                        />
                        <Link
                            className={styles.homeLink}
                            to={demo ? '/' : `/${organization_id}/sessions`}
                        >
                            <HighlightLogoSmall className={styles.logo} />
                            <span className={styles.logoText}>Highlight</span>
                        </Link>
                    </div>
                    <div className={styles.rightHeader}>
                        <div className={styles.searchPrompt}>
                            <div className={classNames(styles.commandWrapper, styles.dontSelect)}>
                                Start a search with
                            <div className={styles.commandContainer}>⌘</div>
                                <div className={styles.commandContainer}>K</div>
                            </div>
                        </div>
                        <UserDropdown />
                    </div>
                </div>
            </div>
            <div className={styles.headerPlaceholder} />
        </>
    );
};



const TrialBanner = ({ timeRemaining }: { timeRemaining: Duration }) => {
    console.log(timeRemaining);
    const { organization_id } = useParams<{ organization_id: string }>();
    const [bannerPresent, setBannerPresent] = useState(true);
    return (
        bannerPresent ?
            <div className={styles.trialWrapper} >
                <div className={classNames(styles.trialTimeText)}>
                    {timeRemaining.days}&nbsp;days left in your trial. Pick a plan <Link onClick={() => setBannerPresent(false)} className={styles.trialLink} to={`/${organization_id}/billing`}>here!</Link>
                </div>
                <Close className={styles.trialCloseStyle} onClick={() => setBannerPresent(false)} />
            </div > :
            <></>
    )
}

export const Header = withRouter(Head);
