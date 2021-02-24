import classNames from 'classnames';
import React, { ReactElement } from 'react';
import Skeleton from 'react-loading-skeleton';
import styles from './SessionToken.module.scss';

interface Props {
    icon: React.ReactNode;
    isLoading: boolean;
}

function SessionToken({
    icon,
    children,
    isLoading,
}: React.PropsWithChildren<Props>): ReactElement {
    return (
        <span className={classNames(styles.sessionToken, 'icon')}>
            {isLoading ? (
                <Skeleton count={1} width={100} />
            ) : (
                <>
                    {icon}
                    <p>{children}</p>
                </>
            )}
        </span>
    );
}

export default SessionToken;
