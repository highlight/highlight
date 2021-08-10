import classNames from 'classnames';
import { H } from 'highlight.run';
import React from 'react';
import { Link } from 'react-router-dom';

import styles from './ButtonLink.module.scss';

interface Props {
    to?: string;
    /** The ID used for identifying that this button was clicked for analytics. */
    trackingId: string;
    className?: string;
    /** Should this button be rendered as a <a>? */
    anchor?: boolean;
    href?: string;
}

const ButtonLink: React.FC<Props> = ({
    to,
    children,
    trackingId,
    className,
    anchor,
    href,
}) => {
    if (anchor) {
        if (!href) {
            throw new Error('href needs to be defined.');
        }
        return (
            <a
                href={href}
                className={classNames(styles.link, className)}
                onClick={() => {
                    H.track(`Link-${trackingId}`);
                }}
                target="_blank"
                rel="noreferrer"
            >
                {children}
            </a>
        );
    }

    if (!to) {
        throw new Error('to needs to be defined.');
    }

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
