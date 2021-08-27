import SvgXIcon from '@icons/XIcon';
import { useApplicationContext } from '@routers/OrgRouter/ApplicationContext';
import classNames from 'classnames/bind';
import { H } from 'highlight.run';
import { History } from 'history';
import moment from 'moment';
import React from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useSessionStorage } from 'react-use';

import { useAuthContext } from '../../authentication/AuthContext';
import { useGetBillingDetailsQuery } from '../../graph/generated/hooks';
import { Maybe, Organization, PlanType } from '../../graph/generated/schemas';
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

interface Props {
    integrated: boolean;
}

export const Header = ({ integrated }: Props) => {
    const { organization_id } = useParams<{ organization_id: string }>();
    const { isLoggedIn } = useAuthContext();

    return (
        <>
            <CommandBar />
            <div
                className={classNames(styles.header, {
                    [styles.guest]: !isLoggedIn,
                })}
            >
                {getBanner(organization_id, integrated)}

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

const getBanner = (organization_id: string, integrated: boolean) => {
    if (process.env.REACT_APP_ENV === 'true') {
        return <OnPremiseBanner />;
    } else if (organization_id === '0') {
        return <DemoWorkspaceBanner integrated={integrated} />;
    } else {
        return <FreePlanBanner />;
    }
};

const FreePlanBanner = () => {
    const [temporarilyHideBanner, setTemporarilyHideBanner] = useSessionStorage(
        'highlightHideFreePlanBanner',
        false
    );
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

    if (organization_id === '0') {
        return null;
    }

    if (temporarilyHideBanner) {
        return null;
    }

    let bannerMessage = `You've used ${data?.billingDetails.meter}/${data?.billingDetails.plan.quota} of your free sessions.`;
    const hasTrial = isOrganizationWithinTrial(data?.organization);
    if (hasTrial) {
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
            {hasTrial && (
                <button
                    onClick={() => {
                        H.track('TemporarilyHideFreePlanBanner', {
                            hasTrial,
                        });
                        setTemporarilyHideBanner(true);
                    }}
                >
                    <SvgXIcon />
                </button>
            )}
        </div>
    );
};

const OnPremiseBanner = () => {
    return (
        <div
            className={styles.trialWrapper}
            style={{
                backgroundColor: 'var(--color-primary-inverted-background)',
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

const DemoWorkspaceBanner = ({ integrated }: Props) => {
    const { currentApplication, allApplications } = useApplicationContext();
    const { pathname } = useLocation();
    const history = useHistory();

    return (
        <div
            className={styles.trialWrapper}
            style={{ cursor: 'pointer' }}
            onClick={() => {
                setHistory(
                    allApplications,
                    currentApplication,
                    history,
                    pathname
                );
            }}
        >
            <Banner className={styles.bannerSvg} />
            <div className={classNames(styles.trialTimeText)}>
                Viewing Demo Workspace. Click to{' '}
                {integrated ? 'Return to ' : 'Create '}
                Your Workspace.
            </div>
        </div>
    );
};

const setHistory = (
    allApplications: Maybe<
        Maybe<
            {
                __typename?: 'Organization' | undefined;
            } & Pick<Organization, 'id' | 'name'>
        >[]
    >,
    currentApplication: Organization | undefined,
    history: History<unknown>,
    pathname: string
) => {
    const [, path] = pathname.split('/').filter((token) => token.length);
    let toVisit = `/new`;

    if (allApplications) {
        if (allApplications[0]?.id !== currentApplication?.id) {
            toVisit = `/${allApplications[0]?.id}/${path}`;
        } else {
            toVisit = `/${
                allApplications[allApplications.length - 1]?.id
            }/${path}`;
        }
    }

    history.push(toVisit);
};
