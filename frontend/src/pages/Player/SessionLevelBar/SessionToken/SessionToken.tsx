import classNames from 'classnames';
import React, { ReactElement } from 'react';
import Skeleton from 'react-loading-skeleton';
import styles from './SessionToken.module.scss';
import { Tooltip } from 'antd';

interface Props {
    icon: React.ReactNode;
    isLoading: boolean;
    tooltipTitle: string;
}

function SessionToken({
    icon,
    children,
    isLoading,
    tooltipTitle,
}: React.PropsWithChildren<Props>): ReactElement {
    return (
        <span className={classNames(styles.sessionToken, 'icon')}>
            {isLoading ? (
                <Skeleton count={1} width={100} />
            ) : (
                <>
                    <Tooltip
                        title={tooltipTitle}
                        arrowPointAtCenter
                        placement="bottomRight"
                    >
                        <div className={styles.iconContainer}>{icon}</div>
                    </Tooltip>
                    <p>{children}</p>
                </>
            )}
        </span>
    );
}

export default SessionToken;
