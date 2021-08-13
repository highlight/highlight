import classNames from 'classnames/bind';
import moment from 'moment';
import React from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import { useAuthContext } from '../../AuthContext';
import { useGetBillingDetailsQuery } from '../../graph/generated/hooks';
import { PlanType } from '../../graph/generated/schemas';
import { ReactComponent as Banner } from '../../static/banner.svg';
import { isOrganizationWithinTrial } from '../../util/billing/billing';
import { HighlightLogo } from '../HighlightLogo/HighlightLogo';
import { CommandBar } from './CommandBar/CommandBar';
import ApplicationPicker from './components/ApplicationPicker/ApplicationPicker';
import FeedbackButton from './components/FeedbackButton/FeedbackButton';
import HeaderActions from './components/HeaderActions';
import PersonalNotificationButton from './components/PersonalNotificationButton/PersonalNotificationButton';
import styles from './Header.module.scss';
import { UserDropdown } from './UserDropdown/UserDropdown';

export const Header = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { isLoggedIn } = useAuthContext();

    return (
        <>
            <CommandBar />
            <div className={styles.header}>
                {process.env.REACT_APP_ONPREM === 'true' ? (
                    <OnPremiseBanner />
                ) : (
                    <FreePlanBanner />
                )}
                <div className={styles.headerContent}>
                    {isLoggedIn ? (
                        <div className={styles.applicationPickerContainer}>
                            <ApplicationPicker />
                        </div>
                    ) : (
                        <div className={styles.logoWrapper}>
                            <Link
                                className={styles.homeLink}
                                to={`/${organization_id}/home`}
                            >
                                <HighlightLogo />
                            </Link>
                        </div>
                    )}
                    <div className={styles.rightHeader}>
                        <HeaderActions />
                        <PersonalNotificationButton />
                        <FeedbackButton />
                        {isLoggedIn && <UserDropdown />}
                    </div>
                </div>
            </div>
        </>
    );
};

const FreePlanBanner = () => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { data, loading } = useGetBillingDetailsQuery({
        variables: { organization_id },
    });

    if (loading) {
        return null;
    }

    if (data?.billingDetails.plan.type !== PlanType.Free) {
        return null;
    }

    let bannerMessage = `You've used ${data?.billingDetails.meter}/${data?.billingDetails.plan.quota} of your free sessions.`;
    if (isOrganizationWithinTrial(data?.organization)) {
        bannerMessage = `You have unlimited sessions until ${moment(
            data?.organization?.trial_end_date
        ).format('MM/DD/YY')}. `;
    }

    return (
        <div className={styles.trialWrapper}>
            <Banner className={styles.bannerSvg} />
            <div className={classNames(styles.trialTimeText)}>
                {bannerMessage + ' '} Upgrade{' '}
                <Link
                    className={styles.trialLink}
                    to={`/${organization_id}/billing`}
                >
                    here!
                </Link>
            </div>
        </div>
    );
};

const OnPremiseBanner = () => {
    return (
        <div
            className={styles.trialWrapper}
            style={{
                backgroundColor: 'var(--color-primary-inverted-background',
            }}
        >
            <Banner
                className={styles.bannerSvg}
                style={{ fill: 'var(--text-primary)' }}
            />
            <div className={classNames(styles.trialTimeText)}>
                Running Highlight On-premise{' '}
                {`v${process.env.REACT_APP_COMMIT_SHA}`}
            </div>
        </div>
    );
};
