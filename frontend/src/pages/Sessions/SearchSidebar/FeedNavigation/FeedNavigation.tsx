import classNames from 'classnames';
import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import styles from './FeedNavigation.module.scss';

const FeedNavigation = () => {
    const { organization_id } = useParams<{
        organization_id: string;
    }>();
    const { pathname } = useLocation();
    const page = pathname.split('/')[2] ?? '';

    return (
        <div className={styles.feedTabNavigation}>
            <Link to={`/${organization_id}/sessions`}>
                <div
                    className={classNames(
                        styles.feedTabItem,
                        styles.feedTabLeft,
                        page.includes('sessions') && styles.feedTabSelected
                    )}
                >
                    Sessions
                </div>
            </Link>
            <Link to={`/${organization_id}/errors`}>
                <div
                    className={classNames(
                        styles.feedTabItem,
                        styles.feedTabRight,
                        page.includes('errors') && styles.feedTabSelected
                    )}
                >
                    Errors
                </div>
            </Link>
        </div>
    );
};

export default FeedNavigation;
