import classNames from 'classnames';
import React from 'react';
import styles from './Dot.module.scss';

interface Props {
    pulse?: boolean;
}

const Dot = ({ pulse }: Props) => {
    return (
        <div className={classNames(styles.dot, { [styles.pulse]: pulse })} />
    );
};

export default Dot;
