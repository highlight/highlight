import classNames from 'classnames';
import React from 'react';

import styles from './Dot.module.scss';

interface Props {
    pulse?: boolean;
    className?: string;
}

const Dot = ({ pulse, className }: Props) => {
    return (
        <div
            className={classNames(styles.dot, className, {
                [styles.pulse]: pulse,
            })}
        />
    );
};

export default Dot;
