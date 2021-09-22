import Button from '@components/Button/Button/Button';
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
    icon?: React.ReactNode;
    fullWidth?: boolean;
    disabled?: boolean;
}

const ButtonLink: React.FC<Props> = ({
    to,
    children,
    trackingId,
    className,
    anchor,
    href,
    icon,
    fullWidth,
    disabled,
}) => {
    if (disabled) {
        return (
            <Button
                disabled
                trackingId={trackingId}
                className={classNames(styles.link, className, {
                    [styles.withIcon]: icon,
                    [styles.fullWidth]: fullWidth,
                })}
            >
                {icon}
                {children}
            </Button>
        );
    }

    if (anchor) {
        if (!href) {
            throw new Error('href needs to be defined.');
        }
        return (
            <a
                href={href}
                className={classNames(styles.link, className, {
                    [styles.withIcon]: icon,
                    [styles.fullWidth]: fullWidth,
                })}
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
            className={classNames(styles.link, className, {
                [styles.withIcon]: icon,
                [styles.fullWidth]: fullWidth,
            })}
            onClick={() => {
                H.track(`Link-${trackingId}`);
            }}
        >
            {icon}
            {children}
        </Link>
    );
};

export default ButtonLink;
