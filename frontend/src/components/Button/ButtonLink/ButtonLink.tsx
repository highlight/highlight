import classNames from 'classnames';
import { H } from 'highlight.run';
import React from 'react';
import { Link } from 'react-router-dom';

import styles from './ButtonLink.module.scss';

interface Props {
    to: string;
    /** The ID used for identifying that this button was clicked for analytics. */
    trackingId: string;
    className?: string;
}

const ButtonLink: React.FC<Props> = ({
    to,
    children,
    trackingId,
    className,
}) => {
    return (
        <Link
            to={to}
            className={classNames(styles.link, className)}
            onClick={() => {
                H.track(`Link-${trackingId}`);
            }}
        >
            {children}
        </Link>
    );
};

export default ButtonLink;
