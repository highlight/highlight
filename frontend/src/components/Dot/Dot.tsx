import classNames from 'classnames';
import React from 'react';

import styles from './Dot.module.scss';

export enum DotSize {
    xSmall,
    xxSmall,
}
interface Props {
    pulse?: boolean;
    size?: DotSize;
}

const Dot = ({ pulse, size = DotSize.xSmall }: Props) => {
    return (
        <div
            className={classNames(styles.dot, {
                [styles.pulse]: pulse,
                [styles.xSmall]: size === DotSize.xSmall,
                [styles.xxSmall]: size === DotSize.xxSmall,
            })}
        />
    );
};

export default Dot;
