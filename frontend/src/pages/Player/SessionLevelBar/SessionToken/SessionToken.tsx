import classNames from 'classnames';
import React, { ReactElement } from 'react';
import styles from './SessionToken.module.scss';

interface Props {
    icon: React.ReactNode;
}

function SessionToken({
    icon,
    children,
}: React.PropsWithChildren<Props>): ReactElement {
    return (
        <span className={classNames(styles.sessionToken, 'icon')}>
            {icon}
            <p>{children}</p>
        </span>
    );
}

export default SessionToken;
