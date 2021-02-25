import classNames from 'classnames';
import React, { ReactElement } from 'react';
import styles from './SessionToken.module.scss';
import { Tooltip } from 'antd';

interface Props {
    icon: React.ReactNode;
    tooltipTitle: string;
}

function SessionToken({
    icon,
    children,
    tooltipTitle,
}: React.PropsWithChildren<Props>): ReactElement {
    return (
        <span className={classNames(styles.sessionToken, 'icon')}>
            <Tooltip
                title={tooltipTitle}
                arrowPointAtCenter
                placement="bottomRight"
            >
                <div className={styles.iconContainer}>{icon}</div>
            </Tooltip>
            <p>{children}</p>
        </span>
    );
}

export default SessionToken;
